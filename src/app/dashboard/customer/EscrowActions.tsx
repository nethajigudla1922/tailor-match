"use client";
 
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, ShieldAlert, CheckCircle2 } from "lucide-react";
 
export function EscrowActions({ bookingId, payment }: { bookingId: string, payment: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  if (!payment) return null;
 
  // If payment has already been released or disputed, show a clean status badge instead!
  if (payment.status === "RELEASED") {
    return (
      <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl p-3 text-xs font-black tracking-wide flex items-center justify-center gap-1.5 mt-3">
        <CheckCircle2 className="w-4 h-4" />
        Payment Released to Tailor (Escrow Complete)
      </div>
    );
  }
 
  if (payment.status === "DISPUTED") {
    return (
      <div className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl p-3 text-xs font-black tracking-wide flex items-center justify-center gap-1.5 mt-3 animate-pulse">
        <ShieldAlert className="w-4 h-4" />
        Payment Frozen (Dispute Opened)
      </div>
    );
  }
 
  if (payment.status !== "ESCROW") return null;
 
  const handleAction = async (action: "RELEASE" | "DISPUTE") => {
    const confirmationMsg = action === "RELEASE" 
      ? "Are you sure you want to approve this delivery and release the secure escrow payment to the tailor?"
      : "Are you sure you want to halt this escrow payment and open a formal dispute for manual fitting review?";
      
    if (!confirm(confirmationMsg)) return;
 
    setLoading(true);
    try {
      const res = await fetch("/api/bookings/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, action })
      });
 
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to process escrow action");
      }
 
      alert(action === "RELEASE" ? "Payment successfully released to tailor!" : "Dispute raised successfully. Support team notified.");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to complete transaction.");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="mt-3 bg-primary/5 border border-primary/15 p-4 rounded-2xl text-left space-y-3">
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-primary flex items-center gap-1">
          <CreditCard className="w-3.5 h-3.5" />
          Escrow Guarantee: ₹{payment.totalAmount.toFixed(2)} Secured
        </span>
        <span className="bg-primary/20 text-primary px-2 py-0.5 rounded font-black tracking-wide text-[9px] uppercase">
          Locked in Escrow
        </span>
      </div>
      
      <p className="text-[10px] text-muted-foreground leading-normal">
        Your payment is safely held in escrow. Approve the delivery if the fitting is perfect, or open a dispute to hold/freeze funds.
      </p>
      
      <div className="flex gap-2 text-xs">
        <button
          type="button"
          disabled={loading}
          onClick={() => handleAction("RELEASE")}
          className="flex-1 py-2 px-3 bg-primary text-primary-foreground font-black rounded-xl hover:bg-primary/95 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 text-center"
        >
          Approve & Release
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => handleAction("DISPUTE")}
          className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold rounded-xl transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 text-center"
        >
          Raise Dispute
        </button>
      </div>
    </div>
  );
}
