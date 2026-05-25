import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ShoppingBag, Calendar } from "lucide-react";
import { EditBookingModal } from "./EditBookingModal";
import { RateReviewModal } from "./RateReviewModal";
import { BookingTracker } from "@/components/BookingTracker";
import { BookingChat } from "@/components/BookingChat";
import { EscrowActions } from "./EscrowActions";
 
export default async function CustomerDashboard() {
  const session = await getServerSession(authOptions);
 
  if (!session || !session.user) {
    redirect("/login");
  }

  if ((session.user as any).role !== "CUSTOMER") {
    redirect("/dashboard");
  }
 
  // Automated Escrow Release Scan on page load:
  // Automatically release any COMPLETED booking payment in ESCROW that has stayed completed for over 7 days.
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const expiredPayments = await prisma.payment.findMany({
      where: {
        status: "ESCROW",
        booking: {
          status: "COMPLETED",
          updatedAt: { lte: sevenDaysAgo }
        }
      }
    });
 
    if (expiredPayments.length > 0) {
      await prisma.payment.updateMany({
        where: {
          id: { in: expiredPayments.map(p => p.id) }
        },
        data: {
          status: "RELEASED"
        }
      });
      console.log(`Background scan auto-released ${expiredPayments.length} escrow payments.`);
    }
  } catch (err) {
    console.error("Auto-release cron error:", err);
  }
 
  // Fetch actual bookings from DB
  const customerProfile = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id as string },
    include: {
      measurements: true,
      bookings: {
        include: { 
          tailor: { include: { user: true } }, 
          service: true,
          payment: true
        },
        orderBy: { appointmentDate: "desc" }
      }
    }
  });
 
  const bookings = customerProfile?.bookings || [];
  const measurements = customerProfile?.measurements || [];
 
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-black mb-8 text-foreground text-left">Welcome, {session.user.name}</h1>
      
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="glass p-8 rounded-3xl border border-primary/20 text-left">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40 flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/25 p-2 rounded-lg text-primary">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">Your Booking Activity</h2>
            </div>
            <a href="/tailors" className="text-xs font-black text-primary hover:underline bg-primary/10 px-4 py-2.5 rounded-xl transition-all">Book Another Service</a>
          </div>
          
          {bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4 animate-bounce" />
              <h3 className="font-bold text-foreground">You have no active bookings</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-6">Book premium tailors and customize your designs at your fingertips.</p>
              <a href="/tailors" className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-md hover:scale-[1.02] transition-all">Find a Tailor</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings.map(booking => {
                const statusStyles: Record<string, string> = {
                  PENDING: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
                  ACCEPTED: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
                  HOME_VISIT: "bg-purple-500/10 text-purple-500 border border-purple-500/20",
                  IN_PROGRESS: "bg-sky-500/10 text-sky-500 border border-sky-500/20",
                  COMPLETED: "bg-green-500/10 text-green-500 border border-green-500/20",
                  REJECTED: "bg-red-500/10 text-red-500 border border-red-500/20"
                };

                const statusLabels: Record<string, string> = {
                  PENDING: "Request Sent",
                  ACCEPTED: "Tailor Confirmed",
                  HOME_VISIT: "Home Visit",
                  IN_PROGRESS: "In Sewing",
                  COMPLETED: "Completed",
                  REJECTED: "Declined"
                };

                return (
                  <div key={booking.id} className="p-5 rounded-2xl bg-background/50 border border-border hover:border-primary/30 transition-all flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="flex justify-between items-start mb-2.5">
                        <h3 className="font-extrabold text-sm truncate max-w-[160px]">{booking.service.name}</h3>
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase shrink-0 ${statusStyles[booking.status] || "bg-primary/10 text-primary border border-primary/20"}`}>
                          {statusLabels[booking.status] || booking.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mb-3">🏪 with {booking.tailor.shopName || booking.tailor.user.name}</p>
                      <div className="flex items-center text-xs font-semibold text-primary mb-4 bg-primary/5 p-2 rounded-xl border border-primary/10 w-fit">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        {new Date(booking.appointmentDate).toLocaleDateString()} at {booking.appointmentTime}
                      </div>
     
                      <BookingTracker status={booking.status} deliveryType={booking.deliveryType} />
                    </div>
   
                  <div className="space-y-3 pt-4 mt-4 border-t border-border/40">
                    {/* Escrow Payment actions visible only for COMPLETED bookings */}
                    {booking.status === "COMPLETED" && booking.payment && (
                       <EscrowActions bookingId={booking.id} payment={booking.payment} />
                    )}
   
                    {booking.status === "PENDING" && (
                      <EditBookingModal booking={booking} />
                    )}
                    {booking.status === "COMPLETED" && (
                      <div className="mt-2">
                        <RateReviewModal tailorId={booking.tailor.id} tailorName={booking.tailor.shopName || booking.tailor.user.name || "Tailor"} />
                      </div>
                    )}
                    <BookingChat bookingId={booking.id} currentUserRole="CUSTOMER" />
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
