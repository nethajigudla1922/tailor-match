"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle2 } from "lucide-react";

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePayment = () => {
    setLoading(true);
    // Simulate payment processing delay
    setTimeout(async () => {
      // In a real app, this would hit a Stripe endpoint to verify payment success
      // and update the Payment status in our database to "ESCROW".
      // For MVP, we will simulate this by directly routing them to success.
      try {
        await fetch("/api/checkout/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: id })
        });
      } catch (e) { console.error(e) }
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/customer");
      }, 2500);
    }, 2000);
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center min-h-[70vh]">
        <CheckCircle2 className="w-24 h-24 text-green-500 mb-6" />
        <h1 className="text-4xl font-bold mb-4">Payment Secured!</h1>
        <p className="text-muted-foreground text-center max-w-md">Your deposit is safely held in TailorConnect Escrow until the job is complete.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 flex items-center justify-center min-h-[70vh]">
      <div className="glass p-8 md:p-12 rounded-3xl border border-primary/20 max-w-lg w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-primary/20 p-4 rounded-full">
            <Lock className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2">Secure Escrow Checkout</h1>
        <p className="text-muted-foreground text-center mb-8">
          This is a simulated checkout. In production, this integrates with Stripe to hold the customer's funds in escrow until the tailor completes the service.
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between pb-4 border-b border-border">
            <span className="font-medium text-muted-foreground">Booking ID</span>
            <span className="font-mono text-sm">{id}</span>
          </div>
          
          <div className="bg-background/50 p-4 rounded-xl space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Simulated Card Number</label>
              <input disabled type="text" value="**** **** **** 4242" className="w-full bg-transparent border border-border rounded-lg px-3 py-2 opacity-70" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Expiry</label>
                <input disabled type="text" value="12/26" className="w-full bg-transparent border border-border rounded-lg px-3 py-2 opacity-70" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CVC</label>
                <input disabled type="text" value="***" className="w-full bg-transparent border border-border rounded-lg px-3 py-2 opacity-70" />
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handlePayment} 
          disabled={loading}
          className="w-full bg-primary text-primary-foreground font-bold rounded-xl px-4 py-4 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? "Processing Payment..." : "Pay Secure Deposit"}
        </button>
      </div>
    </div>
  );
}
