"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, User, Mail, Phone, AlertTriangle, CheckCircle, MessageSquare, Scissors, ShieldAlert } from "lucide-react";
import { BookingStatusButtons } from "./BookingStatusButtons";
import { BookingChat } from "@/components/BookingChat";
import { RecordMeasurementsModal } from "./RecordMeasurementsModal";
import { BookingTracker } from "@/components/BookingTracker";

interface TailorBookingsListProps {
  bookings: any[];
}

export function TailorBookingsList({ bookings }: TailorBookingsListProps) {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [expandedTrackerId, setExpandedTrackerId] = useState<string | null>(null);
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);

  // Extract Alerts for top notification bar
  const newRequests = bookings.filter((b) => b.status === "PENDING");
  const customerUpdates = bookings.filter((b) => b.customerUpdated === true);

  const handleAcknowledge = async (bookingId: string) => {
    setAcknowledgingId(bookingId);
    try {
      const res = await fetch("/api/bookings/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, acknowledgeUpdate: true }),
      });

      if (!res.ok) {
        throw new Error("Failed to acknowledge update");
      }

      alert("Customer order update acknowledged.");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to acknowledge update.");
    } finally {
      setAcknowledgingId(null);
    }
  };

  // Filter bookings based on selected status tab
  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "PENDING") return b.status === "PENDING";
    if (filterStatus === "IN_PROGRESS") return b.status === "IN_PROGRESS" || b.status === "ACCEPTED" || b.status === "HOME_VISIT";
    if (filterStatus === "COMPLETED") return b.status === "COMPLETED";
    if (filterStatus === "CANCELLED") return b.status === "CANCELLED" || b.status === "REJECTED";
    return true;
  });

  const statusStyles: Record<string, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
    ACCEPTED: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
    HOME_VISIT: "bg-purple-500/10 text-purple-500 border border-purple-500/20",
    IN_PROGRESS: "bg-sky-500/10 text-sky-500 border border-sky-500/20",
    COMPLETED: "bg-green-500/10 text-green-500 border border-green-500/20",
    REJECTED: "bg-red-500/10 text-red-500 border border-red-500/20",
    CANCELLED: "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20",
  };

  const statusLabels: Record<string, string> = {
    PENDING: "New Request",
    ACCEPTED: "Confirmed",
    HOME_VISIT: "Home Visit Scheduled",
    IN_PROGRESS: "In Sewing",
    COMPLETED: "Completed",
    REJECTED: "Declined",
    CANCELLED: "Cancelled",
  };

  return (
    <div className="space-y-6">
      {/* 1. Notifications & Real-Time Alerts Center at top */}
      {(newRequests.length > 0 || customerUpdates.length > 0) && (
        <div className="glass p-5 rounded-3xl border border-yellow-500/30 bg-yellow-500/5 text-left space-y-3">
          <h3 className="text-sm font-black text-yellow-600 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-yellow-500 animate-bounce" />
            Notification & Order Action Center
          </h3>

          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-2">
            {/* New Booking alerts */}
            {newRequests.map((req) => (
              <div
                key={req.id}
                className="bg-background/60 border border-yellow-500/10 p-3.5 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <p className="font-extrabold text-foreground">
                    📥 New bespoke tailoring request from{" "}
                    <span className="text-primary">{req.customer.user.name || "Customer"}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Requested Service:{" "}
                    <strong>
                      {req.services && req.services.length > 0
                        ? req.services.map((s: any) => s.name).join(", ")
                        : req.service?.name || "Bespoke Garment"}
                    </strong>{" "}
                    on {new Date(req.appointmentDate).toLocaleDateString()} at {req.appointmentTime}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const el = document.getElementById(`booking-row-${req.id}`);
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-3.5 py-2 bg-primary text-primary-foreground font-black text-[10px] rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    Review Details
                  </button>
                </div>
              </div>
            ))}

            {/* Customer Updates alerts */}
            {customerUpdates.map((upd) => (
              <div
                key={upd.id}
                className="bg-background/60 border border-blue-500/20 p-3.5 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <p className="font-extrabold text-foreground">
                    ⚠️ Order modifications submitted by{" "}
                    <span className="text-blue-500">{upd.customer.user.name || "Customer"}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Scheduled: {new Date(upd.appointmentDate).toLocaleDateString()} at {upd.appointmentTime}.
                    Delivery: {upd.deliveryType.replace("_", " ")}
                  </p>
                  {upd.notes && (
                    <p className="text-[10px] bg-blue-500/5 p-2 rounded-lg border border-blue-500/10 italic text-foreground/80 font-medium">
                      ✏️ Updated Customer Notes: "{upd.notes}"
                    </p>
                  )}
                </div>
                <div>
                  <button
                    disabled={acknowledgingId === upd.id}
                    onClick={() => handleAcknowledge(upd.id)}
                    className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 font-black text-[10px] rounded-xl border border-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {acknowledgingId === upd.id ? "Clearing Alert..." : "Acknowledge Update"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Dense Appointment Filters tabs */}
      <div className="flex flex-wrap bg-background/50 border border-border p-1 rounded-2xl gap-1 w-fit text-left">
        {[
          { label: "All Orders", key: "ALL" },
          { label: "New Requests", key: "PENDING" },
          { label: "Active / In Sewing", key: "IN_PROGRESS" },
          { label: "Completed", key: "COMPLETED" },
          { label: "Cancelled", key: "CANCELLED" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === tab.key
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-background/25"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Dense List View Rows */}
      {filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-background/20 rounded-3xl border border-border">
          <Calendar className="w-12 h-12 text-muted/30 mb-3" />
          <p className="text-xs text-muted-foreground font-semibold">No appointments found matching this status.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Dense List Rows */}
          {filteredBookings.map((booking) => {
            const serviceNames =
              booking.services && booking.services.length > 0
                ? booking.services.map((s: any) => s.name).join(", ")
                : booking.service?.name || "Garment Designing";

            const isTrackerExpanded = expandedTrackerId === booking.id;

            return (
              <div
                key={booking.id}
                id={`booking-row-${booking.id}`}
                className={`p-4 md:p-5 rounded-2xl bg-background/30 border transition-all text-left flex flex-col space-y-4 ${
                  booking.customerUpdated
                    ? "border-blue-500/30 bg-blue-500/5 hover:border-blue-500/40"
                    : "border-border hover:border-primary/30"
                }`}
              >
                {/* Horizontal row layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  {/* Customer Information (Avatar, Name, Email, Phone) */}
                  <div className="col-span-1 lg:col-span-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black uppercase shrink-0 border border-primary/20">
                        {booking.customer.user.name?.charAt(0) || "C"}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-foreground">
                          {booking.customer.user.name || "Customer"}
                        </h4>
                        <span className="text-[9px] px-1.5 py-0.2 bg-primary/15 text-primary border border-primary/20 rounded font-black uppercase tracking-wider shrink-0">
                          {booking.deliveryType === "HOME_VISIT" ? "Home Visit" : "Shop Visit"}
                        </span>
                      </div>
                    </div>
                    {/* Explicitly Render Phone and Email for tailoring transparency */}
                    <div className="text-[10px] text-muted-foreground/90 space-y-0.5 pl-9 font-medium">
                      {booking.customer.user.phone && (
                        <p className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-primary shrink-0" />
                          {booking.customer.user.phone}
                        </p>
                      )}
                      {booking.customer.user.email && (
                        <p className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-primary shrink-0" />
                          {booking.customer.user.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Requested Services */}
                  <div className="col-span-1 lg:col-span-3 space-y-1">
                    <span className="text-[8px] font-black text-primary uppercase tracking-wider">Garments Ordered:</span>
                    <h5 className="font-bold text-xs text-foreground leading-snug">{serviceNames}</h5>
                    {booking.payment && (
                      <p className="text-[10px] text-muted-foreground">
                        Secure Escrow Amt: <strong className="text-foreground">₹{booking.payment.totalAmount.toLocaleString("en-IN")}</strong>
                      </p>
                    )}
                  </div>

                  {/* Schedule Details */}
                  <div className="col-span-1 lg:col-span-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                    <div className="text-[11px]">
                      <p className="font-bold text-foreground">
                        {new Date(booking.appointmentDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-[9px] text-muted-foreground font-semibold">
                        {booking.appointmentTime}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="col-span-1 lg:col-span-2">
                    <span
                      className={`inline-flex items-center text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                        statusStyles[booking.status] ||
                        "bg-primary/10 text-primary border border-primary/20"
                      }`}
                    >
                      {statusLabels[booking.status] || booking.status}
                    </span>
                    {booking.customerUpdated && (
                      <span className="block text-[8px] text-blue-500 font-extrabold uppercase tracking-wide mt-1 animate-pulse">
                        ⚠️ Updated by Customer
                      </span>
                    )}
                  </div>

                  {/* Basic Row actions */}
                  <div className="col-span-1 lg:col-span-2 flex flex-wrap gap-2 lg:justify-end items-center">
                    {booking.status !== "CANCELLED" && booking.status !== "REJECTED" && (
                      <button
                        onClick={() => setExpandedTrackerId(isTrackerExpanded ? null : booking.id)}
                        className={`text-[9px] font-black px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          isTrackerExpanded
                            ? "bg-primary/25 border-primary/30 text-primary"
                            : "bg-background border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {isTrackerExpanded ? "Hide Steps" : "Track Step"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsible steppers */}
                {isTrackerExpanded && (
                  <div className="pt-2 border-t border-border/40 animate-slideDown">
                    <BookingTracker status={booking.status} deliveryType={booking.deliveryType} />
                  </div>
                )}

                {/* 2-Column Details (Left: Address, sizing, notes. Right: Status action buttons & messages) */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 pt-3.5 border-t border-border/30">
                  {/* Left panel: notes, sizing, coordinate */}
                  <div className="space-y-3.5 text-xs">
                    {/* CRITICAL FEATURE: Customer Notes / Request details rendered here! */}
                    {booking.notes ? (
                      <div className="p-3.5 bg-primary/5 border border-primary/15 rounded-xl text-left">
                        <span className="text-[9px] font-black text-primary uppercase tracking-wider block mb-1">
                          📌 Customer Special Requests / Design Instructions:
                        </span>
                        <p className="italic text-foreground font-semibold leading-relaxed">
                          "{booking.notes}"
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-muted/20 border border-border/40 rounded-xl text-[10px] text-muted-foreground italic text-left">
                        No special requests submitted by customer.
                      </div>
                    )}

                    {/* Sizing Parameters */}
                    {(booking.neck || booking.chest || booking.waist || booking.hips || booking.inseam || booking.sleeve || booking.shoulder || booking.armHole) ? (
                      <div className="p-3.5 bg-background/50 rounded-xl border border-border text-[11px]">
                        <div className="flex justify-between items-center mb-2 border-b border-border/40 pb-1.5">
                          <span className="font-extrabold text-foreground">Order Fit Parameters:</span>
                          <span className="text-[8px] bg-green-500/10 text-green-500 border border-green-500/20 px-1.5 py-0.2 rounded font-black uppercase">
                            Logged
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-foreground/80 font-medium">
                          {booking.neck && <div>Neck: <strong className="text-foreground">{booking.neck}"</strong></div>}
                          {booking.chest && <div>Chest: <strong className="text-foreground">{booking.chest}"</strong></div>}
                          {booking.waist && <div>Waist: <strong className="text-foreground">{booking.waist}"</strong></div>}
                          {booking.hips && <div>Hips: <strong className="text-foreground">{booking.hips}"</strong></div>}
                          {booking.inseam && <div>Inseam: <strong className="text-foreground">{booking.inseam}"</strong></div>}
                          {booking.sleeve && <div>Sleeve: <strong className="text-foreground">{booking.sleeve}"</strong></div>}
                          {booking.shoulder && <div>Shoulder: <strong className="text-foreground">{booking.shoulder}"</strong></div>}
                          {booking.armHole && <div>Arm Hole: <strong className="text-foreground">{booking.armHole}"</strong></div>}
                        </div>
                        <RecordMeasurementsModal booking={booking} />
                      </div>
                    ) : (
                      <div className="p-3.5 bg-background/30 rounded-xl border border-border text-center space-y-2">
                        <p className="text-[10px] text-muted-foreground italic font-semibold leading-relaxed">No fitting measurements recorded on order.</p>
                        <RecordMeasurementsModal booking={booking} />
                      </div>
                    )}

                    {/* Home Visit distance and address details */}
                    {booking.deliveryType === "HOME_VISIT" && (booking.pickupAddress || booking.distance !== null) && (
                      <div className="p-3.5 bg-purple-500/5 border border-purple-500/15 rounded-xl space-y-1">
                        <h4 className="text-[9px] font-black text-purple-600 uppercase tracking-wider flex items-center gap-1">
                          📍 Travel Coordinates & Delivery location
                        </h4>
                        {booking.distance !== null && (
                          <p className="font-bold text-foreground">
                            Travel Distance: {booking.distance.toFixed(1)} km
                          </p>
                        )}
                        {booking.pickupAddress && (
                          <p className="text-[10.5px] text-muted-foreground font-medium">
                            Address: <span className="text-foreground">{booking.pickupAddress}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {booking.referenceImage && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-black text-primary uppercase tracking-wider block">Customer Design Reference:</span>
                        <div className="bg-background/40 p-2 rounded-xl border border-border max-w-[200px]">
                          <img
                            src={booking.referenceImage}
                            alt="Design Preview"
                            className="w-full h-32 object-cover rounded-lg border border-border"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right panel: actions and chat */}
                  <div className="space-y-3">
                    {booking.status !== "CANCELLED" && booking.status !== "REJECTED" ? (
                      <>
                        <div className="bg-background/40 border border-border p-3.5 rounded-xl text-left">
                          <span className="text-[9px] font-black text-primary uppercase tracking-wider block mb-1">
                            Sewing / Booking Lifecycle Actions
                          </span>
                          <BookingStatusButtons
                            bookingId={booking.id}
                            currentStatus={booking.status}
                            deliveryType={booking.deliveryType}
                          />
                        </div>

                        {/* Customer updates explicit clear button */}
                        {booking.customerUpdated && (
                          <button
                            disabled={acknowledgingId === booking.id}
                            onClick={() => handleAcknowledge(booking.id)}
                            className="w-full py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/25 font-bold rounded-xl text-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                          >
                            {acknowledgingId === booking.id ? "Clearing alert..." : "Acknowledge Customer Update"}
                          </button>
                        )}

                        <BookingChat bookingId={booking.id} currentUserRole="TAILOR" />
                      </>
                    ) : (
                      <div className="bg-zinc-500/5 border border-zinc-500/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center h-full">
                        <span className="text-2xl mb-1">🚫</span>
                        <p className="text-[10px] text-muted-foreground italic font-semibold">
                          Lifecycle inactive on {booking.status.toLowerCase()} booking.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
