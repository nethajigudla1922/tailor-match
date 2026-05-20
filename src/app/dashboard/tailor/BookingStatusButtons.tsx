"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BookingStatusButtons({ bookingId, currentStatus }: { bookingId: string, currentStatus: string }) {
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
        <button disabled={loading} onClick={() => updateStatus("ACCEPTED")} className="px-3 py-1 bg-green-500/10 text-green-500 rounded font-bold hover:bg-green-500/20 text-xs">Accept</button>
        <button disabled={loading} onClick={() => updateStatus("REJECTED")} className="px-3 py-1 bg-red-500/10 text-red-500 rounded font-bold hover:bg-red-500/20 text-xs">Reject</button>
      </div>
    );
  }

  if (currentStatus === "ACCEPTED") {
    return (
      <div className="flex gap-2 mt-3">
        <button disabled={loading} onClick={() => updateStatus("IN_PROGRESS")} className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded font-bold hover:bg-blue-500/20 text-xs">Start Work</button>
      </div>
    );
  }

  if (currentStatus === "IN_PROGRESS") {
    return (
      <div className="flex gap-2 mt-3">
        <button disabled={loading} onClick={() => updateStatus("COMPLETED")} className="px-3 py-1 bg-primary/20 text-primary rounded font-bold hover:bg-primary/30 text-xs">Mark Completed</button>
      </div>
    );
  }

  return null;
}
