import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Scissors, Calendar, MapPin } from "lucide-react";
import { AddServiceForm } from "./AddServiceForm";
import { ProfileForm } from "./ProfileForm";
import { AddFabricForm } from "./AddFabricForm";
import { BookingStatusButtons } from "./BookingStatusButtons";
import { BookingTracker } from "@/components/BookingTracker";
import { BookingChat } from "@/components/BookingChat";
import { MilestoneManager } from "./MilestoneManager";
import { PortfolioManager } from "./PortfolioManager";

export default async function TailorDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) return null;

  const tailorProfile = await prisma.tailorProfile.findUnique({
    where: { userId: session.user.id as string },
    include: {
      services: true,
      fabrics: true,
      bookings: {
        include: { customer: { include: { user: true } }, service: true, payment: true },
        orderBy: { appointmentDate: "asc" }
      }
    }
  });

  if (!tailorProfile) return null;

  const services = tailorProfile.services || [];
  const fabrics = tailorProfile.fabrics || [];
  const bookings = tailorProfile.bookings || [];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Tailor Dashboard: {session.user.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="glass p-8 rounded-3xl border border-primary/20">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-primary/20 p-2 rounded-lg">
                <Scissors className="text-primary w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">Your Services</h2>
            </div>
            
            {services.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>You haven't listed any services yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {services.map(svc => (
                  <div key={svc.id} className="p-4 rounded-xl border border-border bg-background/30 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{svc.name}</h3>
                      <p className="text-sm text-muted-foreground">{svc.category} • {svc.occasion}</p>
                    </div>
                    <div className="font-bold text-primary">₹{svc.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
            
            <AddServiceForm />
          </div>

          <div className="glass p-8 rounded-3xl border border-primary/20">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-primary/20 p-2 rounded-lg">
                <Scissors className="text-primary w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">Your Fabrics</h2>
            </div>
            
            {fabrics.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>You haven't added any fabrics yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {fabrics.map((fab: any) => (
                  <div key={fab.id} className="p-4 rounded-xl border border-border bg-background/30 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{fab.name}</h3>
                      <p className="text-sm text-muted-foreground">{fab.material}</p>
                    </div>
                    <div className="font-bold text-primary">₹{fab.pricePerMeter.toFixed(2)} / meter</div>
                  </div>
                ))}
              </div>
            )}
            
            <AddFabricForm />
          </div>

          <PortfolioManager />

          <div className="glass p-8 rounded-3xl border border-border/50">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-muted/20 p-2 rounded-lg">
                <MapPin className="text-foreground w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">Profile Details</h2>
            </div>
            
            <ProfileForm initialData={tailorProfile} />
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border border-border/50 h-fit">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-muted/20 p-2 rounded-lg">
              <Calendar className="text-foreground w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Appointments</h2>
          </div>
          
          {bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="w-12 h-12 text-muted/30 mb-4" />
              <p className="text-muted-foreground">No upcoming appointments.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div key={booking.id} className="p-4 rounded-xl bg-background/50 border border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{booking.customer.user.name || "Customer"}</h3>
                    <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded font-bold uppercase">{booking.status}</span>
                  </div>
                  <p className="text-sm text-foreground/80 mb-2">{booking.service.name}</p>
                  <div className="flex items-center text-xs text-muted-foreground font-medium mb-2">
                    <Calendar className="w-3 h-3 mr-1" />
                    {booking.appointmentDate.toLocaleDateString()} at {booking.appointmentTime}
                  </div>
                  <BookingTracker status={booking.status} />
                  <MilestoneManager bookingId={booking.id} />
                  {booking.payment && (
                    <div className="mt-2.5 p-2.5 bg-background/40 border border-border/80 rounded-xl text-xs flex justify-between items-center">
                      <span className="font-bold text-muted-foreground">Earnings:</span>
                      {booking.payment.status === "ESCROW" && (
                        <span className="text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-lg font-black uppercase">
                          Escrow Secured (₹{booking.payment.totalAmount.toFixed(0)})
                        </span>
                      )}
                      {booking.payment.status === "RELEASED" && (
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-lg font-black uppercase">
                          Released (₹{booking.payment.tailorEarnings.toFixed(0)} Earned)
                        </span>
                      )}
                      {booking.payment.status === "DISPUTED" && (
                        <span className="text-[9px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-lg font-black uppercase animate-pulse">
                          Frozen / Disputed
                        </span>
                      )}
                      {booking.payment.status === "PENDING" && (
                        <span className="text-[9px] bg-gray-500/10 text-gray-500 border border-gray-500/20 px-2 py-0.5 rounded-lg font-black uppercase">
                          Pending Payment
                        </span>
                      )}
                    </div>
                  )}
                  <div className="text-xs bg-muted/50 p-2 rounded mt-2 space-y-1">
                    <div><strong>Type:</strong> {booking.deliveryType.replace("_", " ")}</div>
                    {booking.deliveryType === "HOME_VISIT" && (
                      <>
                        {booking.distance !== null && (
                          <div className="text-primary font-bold">
                            📍 Pickup Distance: {booking.distance.toFixed(1)} km
                          </div>
                        )}
                        {booking.pickupAddress && (
                          <div className="text-muted-foreground italic">
                            🏠 Address: {booking.pickupAddress}
                          </div>
                        )}
                        {(booking.pickupLatitude !== null && booking.pickupLongitude !== null) && (
                          <div className="text-[10px] text-muted-foreground/60">
                            GPS: {booking.pickupLatitude.toFixed(4)}, {booking.pickupLongitude.toFixed(4)}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {(booking.neck || booking.chest || booking.waist || booking.hips || booking.inseam || booking.sleeve || booking.shoulder) && (
                    <div className="mt-3 p-3 bg-primary/5 rounded-xl border border-primary/10 text-xs">
                      <p className="font-bold text-primary mb-2">Order Measurements:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {booking.neck && <div><strong>Neck:</strong> {booking.neck}</div>}
                        {booking.chest && <div><strong>Chest:</strong> {booking.chest}</div>}
                        {booking.waist && <div><strong>Waist:</strong> {booking.waist}</div>}
                        {booking.hips && <div><strong>Hips:</strong> {booking.hips}</div>}
                        {booking.inseam && <div><strong>Inseam:</strong> {booking.inseam}</div>}
                        {booking.sleeve && <div><strong>Sleeve:</strong> {booking.sleeve}</div>}
                        {booking.shoulder && <div><strong>Shoulder:</strong> {booking.shoulder}</div>}
                      </div>
                    </div>
                  )}
                  {booking.referenceImage && (
                    <div className="mt-4 border-t border-border/50 pt-4">
                      <p className="text-sm font-bold text-foreground mb-2">Design Reference:</p>
                      <div className="bg-background/50 p-2 rounded-xl border border-border">
                        <img 
                          src={booking.referenceImage} 
                          alt="Design Reference" 
                          className="w-full max-h-96 object-contain rounded-lg" 
                        />
                      </div>
                    </div>
                  )}
                  <BookingChat bookingId={booking.id} currentUserRole="TAILOR" />
                  <BookingStatusButtons bookingId={booking.id} currentStatus={booking.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
