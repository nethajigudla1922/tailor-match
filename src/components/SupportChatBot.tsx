"use client";
 
import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, ShieldCheck, Sparkles } from "lucide-react";
 
interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  createdAt: Date;
}
 
export function SupportChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "👋 Namaste! I am your TailorConnect Support Assistant. How can I help you elevate your styling experience today?",
      createdAt: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unreadDot, setUnreadDot] = useState(true);
 
  const messagesEndRef = useRef<HTMLDivElement>(null);
 
  // Scroll to bottom helper specifically localized inside the chat panel
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
 
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadDot(false);
    }
  }, [messages, isOpen]);
 
  const quickReplies = [
    { label: "🙋‍♂️ How do I book?", keyword: "book" },
    { label: "📏 Measurements", keyword: "measurement" },
    { label: "🛡️ Payment Safety", keyword: "payment" },
    { label: "🚗 Home Visits", keyword: "travel" },
    { label: "📞 Human Support", keyword: "contact" }
  ];
 
  // Keyword-matching intelligence for dynamic automated support replies
  const getAutomatedReply = (input: string): string => {
    const text = input.toLowerCase();
 
    if (text.includes("book") || text.includes("order") || text.includes("service")) {
      return "To book a master tailor, simply browse our Stylist Catalog at /tailors. Filter by categories, click 'View Services', choose your fit details, and submit! You can choose between a convenient Home Visit or a Shop Visit.";
    }
    if (text.includes("measurement") || text.includes("size") || text.includes("fit") || text.includes("mannequin")) {
      return "Measurements are saved individually as 'Named Fit Sets' (e.g., 'My Wedding Suit', 'Dad's Fit'). Our dashboard features a glassmorphic vector mannequin guide. When you focus on Neck, Chest, or Waist sizing, it glows dynamically on the SVG layout to show you exactly how to measure!";
    }
    if (text.includes("payment") || text.includes("safe") || text.includes("escrow") || text.includes("rupee") || text.includes("inr")) {
      return "TailorConnect utilizes a secure Escrow payment standard. All payments are held safely in escrow and are only released to the tailor after you approve the final delivery. Full refunds are processed instantly if bookings are canceled.";
    }
    if (text.includes("travel") || text.includes("visit") || text.includes("home") || text.includes("distance") || text.includes("km")) {
      return "Tailors offering home visits have a green 'Home Visit' badge. You can sort by 'Nearest to Me' to calculate precise real-world distances in kilometers (km) and see travel fees instantly!";
    }
    if (text.includes("contact") || text.includes("support") || text.includes("human") || text.includes("help") || text.includes("call")) {
      return "Our dedicated human support team is available Mon-Sat (9 AM - 6 PM). You can email us at support@tailorconnect.com or call our toll-free hotline: +1-800-FIT-WELL (348-9355).";
    }
    if (text.includes("hi") || text.includes("hello") || text.includes("hey")) {
      return "Hello! Hope you are having a wonderful day. Please choose one of the quick support links or ask any questions about custom tailors, fittings, or payments!";
    }
 
    return "Thank you for asking! I am currently learning. For direct, immediate assistance regarding this, please feel free to email support@tailorconnect.com or call our toll-free support line at +1-800-FIT-WELL.";
  };
 
  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
 
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text,
      createdAt: new Date(),
    };
 
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);
 
    // Simulate natural typing delay (800ms) for high-fidelity interactive feel
    setTimeout(() => {
      const botMsg: Message = {
        id: Math.random().toString(),
        sender: "bot",
        text: getAutomatedReply(text),
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 850);
  };
 
  return (
    <div className="fixed bottom-6 right-6 z-50 text-left font-sans">
      {/* Dynamic Pulsing Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer border border-white/10"
        >
          {unreadDot && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[8px] text-white font-black items-center justify-center">1</span>
            </span>
          )}
          <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </button>
      )}
 
      {/* Support Chat Panel Container */}
      {isOpen && (
        <div className="w-[340px] md:w-[380px] h-[500px] glass border border-primary/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp relative z-50 backdrop-blur-md">
          {/* Header */}
          <div className="bg-primary/10 border-b border-primary/20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30 relative">
                <Bot className="w-5 h-5 text-primary" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-zinc-950 animate-pulse"></span>
              </div>
              <div>
                <h3 className="text-sm font-black text-foreground flex items-center gap-1">
                  Styling Assistant
                  <Sparkles className="w-3 h-3 text-primary" />
                </h3>
                <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-blue-400" />
                  Verified Support Bot
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
 
          {/* Messages Scroll Panel */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Bot Icon */}
                {msg.sender === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 self-end">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
 
                {/* Message bubble */}
                <div
                  className={`max-w-[75%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-background/80 border border-border/60 text-foreground/90 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
 
            {/* Animated Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-background/80 border border-border/60 rounded-2xl rounded-bl-none p-3.5 flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce delay-200"></span>
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce delay-300"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
 
          {/* Quick reply tags/chips */}
          <div className="p-3 border-t border-border/30 bg-background/25 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
            {quickReplies.map((reply) => (
              <button
                key={reply.label}
                onClick={() => handleSendMessage(reply.label)}
                className="px-3 py-1.5 bg-background border border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-primary rounded-xl text-[10px] font-bold transition-all active:scale-95 shrink-0 cursor-pointer"
              >
                {reply.label}
              </button>
            ))}
          </div>
 
          {/* Text Input Footer bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-3 bg-background/40 border-t border-border/30 flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="w-9.5 h-9.5 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shrink-0 hover:bg-primary/95 transition-all active:scale-[0.96] disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
