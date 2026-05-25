"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BookingStatusButtons({ 
  bookingId, 
  currentStatus, 
  deliveryType = "SHOP_VISIT" 
}: { 
  bookingId: string; 
  currentStatus: string; 
  deliveryType?: string; 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: newStatus })
      });
      
      if (!res.ok) throw new Error("Failed to update status");
      
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update booking status.");
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus === "PENDING") {
    return (
      <div className="flex gap-2 mt-3">
        <button 
          disabled={loading} 
          onClick={() => updateStatus("ACCEPTED")} 
          className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-xl font-black text-xs transition-all cursor-pointer"
        >
          Accept Request
        </button>
        <button 
          disabled={loading} 
          onClick={() => updateStatus("REJECTED")} 
          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-black text-xs transition-all cursor-pointer"
        >
          Reject
        </button>
      </div>
    );
  }

  if (currentStatus === "ACCEPTED") {
    return (
      <div className="flex gap-2 mt-3">
        {deliveryType === "HOME_VISIT" ? (
          <>
            <button 
              disabled={loading} 
              onClick={() => updateStatus("HOME_VISIT")} 
              className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 rounded-xl font-black text-xs transition-all cursor-pointer"
            >
              Start Home Visit
            </button>
            <button 
              disabled={loading} 
              onClick={() => updateStatus("IN_PROGRESS")} 
              className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-xl font-black text-xs transition-all cursor-pointer border border-blue-500/10"
            >
              Skip to Sewing
            </button>
          </>
        ) : (
          <button 
            disabled={loading} 
            onClick={() => updateStatus("IN_PROGRESS")} 
            className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-xl font-black text-xs transition-all cursor-pointer"
          >
            Start Sewing
          </button>
        )}
      </div>
    );
  }

  if (currentStatus === "HOME_VISIT") {
    return (
      <div className="flex gap-2 mt-3">
        <button 
          disabled={loading} 
          onClick={() => updateStatus("IN_PROGRESS")} 
          className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-xl font-black text-xs transition-all cursor-pointer"
        >
          Start Sewing
        </button>
      </div>
    );
  }

  if (currentStatus === "IN_PROGRESS") {
    return (
      <div className="flex gap-2 mt-3">
        <button 
          disabled={loading} 
          onClick={() => updateStatus("COMPLETED")} 
          className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl font-black text-xs transition-all cursor-pointer"
        >
          Mark Completed
        </button>
      </div>
    );
  }

  return null;
}
