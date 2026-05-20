import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Ruler, ShoppingBag, Calendar } from "lucide-react";
import { MeasurementForm } from "./MeasurementForm";
import { EditBookingModal } from "./EditBookingModal";
import { RateReviewModal } from "./RateReviewModal";
import { BookingTracker } from "@/components/BookingTracker";
import { BookingChat } from "@/components/BookingChat";
import { EscrowActions } from "./EscrowActions";
import { CustomerMilestones } from "./CustomerMilestones";
 
export default async function CustomerDashboard() {
  const session = await getServerSession(authOptions);
 
  if (!session || !session.user) return null;
 
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
      <h1 className="text-3xl font-bold mb-8">Welcome, {session.user.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 glass p-8 rounded-3xl border border-primary/20">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Ruler className="text-primary w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">Your Digital Measurement Profile</h2>
          </div>
          <p className="text-muted-foreground mb-8">Save your exact body measurements to easily share them with your booked tailors.</p>
          
          <MeasurementForm initialData={measurements} />
        </div>
 
        <div className="glass p-8 rounded-3xl border border-border/50 h-fit">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-muted/20 p-2 rounded-lg">
                <ShoppingBag className="text-foreground w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">Recent Bookings</h2>
            </div>
            <a href="/tailors" className="text-sm font-medium text-primary hover:underline">Book Another Service</a>
          </div>
          
          {bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="w-12 h-12 text-muted/30 mb-4" />
              <p className="text-muted-foreground">You have no active bookings.</p>
              <a href="/tailors" className="mt-4 text-primary hover:underline font-medium text-sm">Find a Tailor</a>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div key={booking.id} className="p-4 rounded-xl bg-background/50 border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-sm truncate max-w-[150px]">{booking.service.name}</h3>
                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded font-bold uppercase shrink-0">{booking.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">with {booking.tailor.shopName || booking.tailor.user.name}</p>
                  <div className="flex items-center text-xs font-semibold text-primary mb-3">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    {new Date(booking.appointmentDate).toLocaleDateString()} at {booking.appointmentTime}
                  </div>
 
                  <BookingTracker status={booking.status} />
                  <CustomerMilestones bookingId={booking.id} />
 
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
