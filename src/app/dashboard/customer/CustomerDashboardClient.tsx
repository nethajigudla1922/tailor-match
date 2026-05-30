"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Calendar, User, Ruler, Trash2, Edit3, MessageSquare, AlertCircle } from "lucide-react";
import { EditBookingModal } from "./EditBookingModal";
import { RateReviewModal } from "./RateReviewModal";
import { BookingTracker } from "@/components/BookingTracker";
import { BookingChat } from "@/components/BookingChat";
import { EscrowActions } from "./EscrowActions";
import { CustomerProfileForm } from "./CustomerProfileForm";
import { MeasurementForm } from "./MeasurementForm";

interface CustomerDashboardClientProps {
  bookings: any[];
  measurements: any[];
  customerProfile: any;
  userName: string;
}

export function CustomerDashboardClient({
  bookings,
  measurements,
  customerProfile,
  userName,
}: CustomerDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"bookings" | "profile">("bookings");
  const [expandedTrackerId, setExpandedTrackerId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking request? This action cannot be undone.")) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: "CANCELLED" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel booking");
      }

      alert("Booking request cancelled successfully.");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "An error occurred while cancelling booking.");
    } finally {
      setCancellingId(null);
    }
  };

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
    PENDING: "Awaiting Confirmed",
    ACCEPTED: "Tailor Confirmed",
    HOME_VISIT: "Home Visit scheduled",
    IN_PROGRESS: "In Sewing",
    COMPLETED: "Completed",
    REJECTED: "Declined",
    CANCELLED: "Cancelled",
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Header Card */}
      <div className="glass p-6 md:p-8 rounded-3xl border border-primary/20 flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-left">
        <div>
          <span className="text-xs font-black tracking-wider text-primary uppercase">Customer Hub</span>
          <h1 className="text-3xl md:text-4xl font-black text-foreground mt-1">Welcome back, {userName}</h1>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-xl">
            Track your bespoke tailoring requests, update your measurements, and communicate with your private tailors all in one secure place.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-background/50 border border-border p-1 rounded-2xl self-start md:self-center shrink-0 shadow-inner">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "bookings"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-background/25"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Active Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "profile"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-background/25"
            }`}
          >
            <User className="w-4 h-4" />
            Profile & Sizing
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "bookings" ? (
        <div className="glass p-6 md:p-8 rounded-3xl border border-border text-left">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40 flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Your Booking Activity</h2>
            </div>
            <a
              href="/tailors"
              className="text-xs font-black text-primary hover:underline bg-primary/10 px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              Book Another Service
            </a>
          </div>

          {bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
              <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4 animate-bounce" />
              <h3 className="font-bold text-foreground text-lg">You have no active bookings</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-6 leading-relaxed">
                Connect with premium tailors, browse custom tailoring designs, and place your order securely.
              </p>
              <a
                href="/tailors"
                className="px-6 py-3.5 bg-primary text-primary-foreground rounded-xl font-black text-xs shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Browse Private Tailors
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Dense List View Container */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3 bg-muted/20 border border-border/60 rounded-xl text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <div className="col-span-3">Tailor & Services</div>
                <div className="col-span-2">Schedule & Date</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Escrow Status</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>

              <div className="space-y-3">
                {bookings.map((booking) => {
                  const serviceNames =
                    booking.services && booking.services.length > 0
                      ? booking.services.map((s: any) => s.name).join(", ")
                      : booking.service?.name || "Bespoke Custom Fitting";

                  const isTrackerExpanded = expandedTrackerId === booking.id;

                  return (
                    <div
                      key={booking.id}
                      className="p-4 md:p-5 rounded-2xl bg-background/40 border border-border/80 hover:border-primary/30 transition-all shadow-sm text-left flex flex-col space-y-4"
                    >
                      {/* Responsive Layout Row */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                        {/* Column 1: Service Name & Tailor Shop */}
                        <div className="col-span-1 lg:col-span-3 space-y-1">
                          <h3 className="font-extrabold text-sm text-foreground leading-snug">
                            {serviceNames}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="shrink-0 text-muted-foreground/60">🏪</span>
                            <span className="font-medium truncate max-w-[200px]">
                              {booking.tailor.shopName || booking.tailor.user.name}
                            </span>
                          </div>
                        </div>

                        {/* Column 2: Date & Time */}
                        <div className="col-span-1 lg:col-span-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary shrink-0" />
                          <div className="text-xs">
                            <p className="font-bold text-foreground">
                              {new Date(booking.appointmentDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-semibold">
                              {booking.appointmentTime}
                            </p>
                          </div>
                        </div>

                        {/* Column 3: Status Badge */}
                        <div className="col-span-1 lg:col-span-2">
                          <span
                            className={`inline-flex items-center text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                              statusStyles[booking.status] ||
                              "bg-primary/10 text-primary border border-primary/20"
                            }`}
                          >
                            {statusLabels[booking.status] || booking.status}
                          </span>
                        </div>

                        {/* Column 4: Payment Escrow status */}
                        <div className="col-span-1 lg:col-span-2">
                          {booking.payment ? (
                            <div className="flex flex-col gap-0.5">
                              {booking.payment.status === "ESCROW" && (
                                <span className="inline-flex text-[9px] bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 px-2 py-0.5 rounded-full font-bold uppercase w-fit">
                                  Escrow Secured
                                </span>
                              )}
                              {booking.payment.status === "RELEASED" && (
                                <span className="inline-flex text-[9px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase w-fit">
                                  Paid & Released
                                </span>
                              )}
                              {booking.payment.status === "DISPUTED" && (
                                <span className="inline-flex text-[9px] bg-red-500/10 text-red-600 border border-red-500/20 px-2 py-0.5 rounded-full font-bold uppercase w-fit animate-pulse">
                                  Escrow Disputed
                                </span>
                              )}
                              {booking.payment.status === "PENDING" && (
                                <span className="inline-flex text-[9px] bg-zinc-500/15 text-zinc-500 border border-zinc-500/20 px-2 py-0.5 rounded-full font-bold uppercase w-fit">
                                  Pending Payment
                                </span>
                              )}
                              <span className="text-[10px] font-bold text-foreground ml-1 mt-0.5">
                                ₹{booking.payment.totalAmount.toLocaleString("en-IN")}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-medium italic">
                              No payment tied
                            </span>
                          )}
                        </div>

                        {/* Column 5: Action Buttons */}
                        <div className="col-span-1 lg:col-span-3 flex flex-wrap gap-2 lg:justify-end items-center">
                          {/* Stepper tracker toggle */}
                          {booking.status !== "CANCELLED" && booking.status !== "REJECTED" && (
                            <button
                              onClick={() =>
                                setExpandedTrackerId(isTrackerExpanded ? null : booking.id)
                              }
                              className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                                isTrackerExpanded
                                  ? "bg-primary/20 border-primary/30 text-primary"
                                  : "bg-background border-border text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {isTrackerExpanded ? "Hide Steps" : "Track Order"}
                            </button>
                          )}

                          {booking.status === "PENDING" && (
                            <>
                              <EditBookingModal booking={booking} />
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                disabled={cancellingId === booking.id}
                                className="flex items-center justify-center gap-1 px-3 py-2 text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                {cancellingId === booking.id ? "Cancelling..." : "Cancel Order"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Expandable Stepper Tracker Area */}
                      {isTrackerExpanded && (
                        <div className="pt-2 border-t border-border/40 animate-slideDown">
                          <BookingTracker status={booking.status} deliveryType={booking.deliveryType} />
                        </div>
                      )}

                      {/* Expandable Action Cards (Escrow, Reviews, Custom design, and chat) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border/30">
                        {/* Left Side: Escrow Actions & Reviews */}
                        <div className="space-y-3">
                          {booking.status === "COMPLETED" && booking.payment && (
                            <EscrowActions bookingId={booking.id} payment={booking.payment} />
                          )}
                          {booking.status === "COMPLETED" && (
                            <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl">
                              <h4 className="text-xs font-bold text-primary mb-1">Satisfied with your custom outfit?</h4>
                              <p className="text-[10px] text-muted-foreground mb-3 leading-normal">
                                Share your feedback to help the tailor maintain their premium bespoke status.
                              </p>
                              <RateReviewModal
                                tailorId={booking.tailor.id}
                                tailorName={booking.tailor.shopName || booking.tailor.user.name}
                              />
                            </div>
                          )}

                          {booking.status === "PENDING" && (
                            <div className="bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-xl flex gap-2 items-start text-[10px] text-muted-foreground leading-normal">
                              <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                              <p>
                                💡 Your custom booking is currently under review by the tailor. You can modify order dates, notes, or cancel your request fully without penalty until it is accepted.
                              </p>
                            </div>
                          )}

                          {booking.status === "ACCEPTED" && (
                            <div className="bg-primary/5 border border-primary/10 p-3.5 rounded-xl text-[10px] text-muted-foreground leading-relaxed">
                              <p className="font-extrabold text-foreground mb-1">📅 Tailor Confirmed Order!</p>
                              Your tailor is preparing fabric templates and sewing patterns. Use the message thread on the right to coordinate design adjustments, measurements checks, or fabrics.
                            </div>
                          )}

                          {booking.notes && (
                            <div className="bg-background/25 border border-border/80 p-3 rounded-xl text-xs">
                              <span className="font-black text-muted-foreground uppercase text-[9px] tracking-wider block mb-1">Your Custom Request Notes:</span>
                              <p className="italic text-foreground/80 font-medium">"{booking.notes}"</p>
                            </div>
                          )}
                        </div>

                        {/* Right Side: Message Chat thread */}
                        <div>
                          {booking.status !== "CANCELLED" ? (
                            <BookingChat bookingId={booking.id} currentUserRole="CUSTOMER" />
                          ) : (
                            <div className="bg-zinc-500/5 border border-zinc-500/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center h-full">
                              <span className="text-2xl mb-1">🚫</span>
                              <p className="text-[10px] text-muted-foreground italic font-semibold">
                                Chat disabled on cancelled booking.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Profile & Sizing Tab Panel */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Left Column: Personal details */}
          <div className="xl:col-span-5 glass p-6 md:p-8 rounded-3xl border border-border text-left">
            <CustomerProfileForm profile={customerProfile} />
          </div>

          {/* Right Column: Measurements details */}
          <div className="xl:col-span-7 glass p-6 md:p-8 rounded-3xl border border-border text-left space-y-6">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border/40 pb-3">
                <Ruler className="w-5 h-5 text-primary" />
                Bespeak Digital Sizing & Measurements
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Log your custom body fitting sizes to instantly sync them with tailors when placing bookings. Use saved sizing profiles for multiple fits (slim, standard, tuxedo fits).
              </p>
            </div>
            <MeasurementForm initialData={measurements} />
          </div>
        </div>
      )}
    </div>
  );
}
