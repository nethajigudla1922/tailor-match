"use client";
 
import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X } from "lucide-react";
 
export function BookingChat({ bookingId, currentUserRole }: { bookingId: string, currentUserRole: "CUSTOMER" | "TAILOR" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const isOpenRef = useRef(isOpen);
 
  // Keep isOpenRef synchronized to prevent closures/dependency loops
  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) {
      setHasUnread(false);
    }
  }, [isOpen]);
 
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat?bookingId=${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        
        setMessages((prevMessages) => {
          if (prevMessages.length > 0 && data.length > prevMessages.length) {
            // New messages arrived
            const newMsgs = data.slice(prevMessages.length);
            const hasIncoming = newMsgs.some((m: any) => m.senderRole !== currentUserRole);
            if (hasIncoming && !isOpenRef.current) {
              setHasUnread(true);
            }
          } else if (prevMessages.length === 0 && data.length > 0) {
            // Initial load check: if the latest message was sent by the other person
            const lastMsg = data[data.length - 1];
            if (lastMsg && lastMsg.senderRole !== currentUserRole && !isOpenRef.current) {
              setHasUnread(true);
            }
          }
          return data;
        });
      }
    } catch (err) {
      console.error("Error loading chat messages:", err);
    }
  };
 
  const [isActive, setIsActive] = useState(true);
  const [isIdle, setIsIdle] = useState(false);
 
  // 1. Detect tab visibility status to halt background tab database reads completely
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsActive(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);
 
  // 2. Track user idle state (3 minutes threshold) to scale down database requests
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    const resetIdle = () => {
      setIsIdle(false);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setIsIdle(true), 180000); // 3 minutes idle
    };
 
    window.addEventListener("mousemove", resetIdle);
    window.addEventListener("keydown", resetIdle);
    window.addEventListener("click", resetIdle);
    
    resetIdle();
 
    return () => {
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("keydown", resetIdle);
      window.removeEventListener("click", resetIdle);
      clearTimeout(idleTimer);
    };
  }, []);
 
  // 3. Adaptive Polling Loop with Exponential Backoff
  useEffect(() => {
    if (!isActive) return; // Completely freeze polling if tab is backgrounded!
 
    fetchMessages(); // Run instantly on visibility restore/focus
 
    // Determine ideal speed: 5s if chat is open, 15s if closed/background, 30s if idle!
    const pollingInterval = isIdle ? 30000 : isOpen ? 5000 : 15000;
    const interval = setInterval(fetchMessages, pollingInterval);
 
    return () => clearInterval(interval);
  }, [bookingId, isActive, isIdle, isOpen]);
 
  // Scroll messages container to bottom without scrolling browser window
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isOpen]);
 
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
 
    const messageToSend = inputText.trim();
    setInputText("");
    setLoading(true);
 
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, text: messageToSend }),
      });
 
      if (res.ok) {
        const newMessage = await res.json();
        setMessages((prev) => [...prev, newMessage]);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="mt-3 relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 transition-all active:scale-[0.98] relative"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        {isOpen ? "Hide Chat Thread" : `Message ${currentUserRole === "CUSTOMER" ? "Tailor" : "Customer"}`}
        
        {/* Visual notifications indicator badge next to title */}
        {!isOpen && hasUnread && (
          <span className="ml-1 px-1.5 py-0.5 text-[8px] bg-red-500 text-white rounded-full font-black tracking-wider animate-pulse flex items-center justify-center">
            NEW
          </span>
        )}
 
        {/* Pulsing red notification ring in corner */}
        {!isOpen && hasUnread && (
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        )}
      </button>
 
      {isOpen && (
        <div className="mt-2 glass border border-border/60 rounded-2xl overflow-hidden flex flex-col h-72 animate-slideDown text-left">
          {/* Header */}
          <div className="bg-background/40 px-3 py-2 border-b border-border/50 flex justify-between items-center">
            <span className="text-[10px] font-bold text-primary flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-primary" />
              Direct Message Channel
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
 
          {/* Messages */}
          <div ref={chatContainerRef} className="flex-1 p-3 overflow-y-auto space-y-2 bg-background/10">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <p className="text-[10px] text-muted-foreground italic">
                  No messages yet. Say hello to clarify fitting, date changes, or fabrics!
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.senderRole === currentUserRole;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-1.5 text-xs ${
                        isMine
                          ? "bg-primary text-primary-foreground rounded-tr-none shadow-md shadow-primary/10"
                          : "bg-background/60 border border-border/50 rounded-tl-none text-foreground"
                      }`}
                    >
                      <p className="leading-tight">{msg.text}</p>
                      <span className="text-[8px] text-muted-foreground/60 block mt-0.5 text-right">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
 
          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-2 border-t border-border/40 bg-background/20 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-background border border-border/50 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="bg-primary hover:bg-primary/95 text-primary-foreground p-1.5 rounded-xl transition-all disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
