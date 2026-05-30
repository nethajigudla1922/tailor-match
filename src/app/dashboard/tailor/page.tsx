import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Scissors, Calendar, MapPin } from "lucide-react";
import { AddServiceForm } from "./AddServiceForm";
import { ServiceManager } from "./ServiceManager";
import { ProfileForm } from "./ProfileForm";
import { AddFabricForm } from "./AddFabricForm";
import { PortfolioManager } from "./PortfolioManager";
import { TailorBookingsList } from "./TailorBookingsList";

export const dynamic = 'force-dynamic';

export default async function TailorDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  if ((session.user as any).role !== "TAILOR") {
    redirect("/dashboard");
  }

  const tailorProfile = await prisma.tailorProfile.findUnique({
    where: { userId: session.user.id as string },
    include: {
      services: true,
      fabrics: true,
      bookings: {
        include: { 
          customer: { include: { user: true } }, 
          service: true,
          services: true,
          payment: true 
        },
        orderBy: { appointmentDate: "asc" }
      }
    }
  });

  if (!tailorProfile) return null;

  const services = tailorProfile.services || [];
  const fabrics = tailorProfile.fabrics || [];
  const bookings = tailorProfile.bookings || [];

  return (
    <div className="container mx-auto px-4 py-12 space-y-8 text-left">
      <div>
        <span className="text-xs font-black tracking-wider text-primary uppercase">Tailoring Atelier Portal</span>
        <h1 className="text-3xl md:text-4xl font-black text-foreground mt-1">Atelier Dashboard: {session.user.name}</h1>
        <p className="text-xs text-muted-foreground mt-1 max-w-xl">
          Manage your bespoke tailoring catalog, update your operating settings, chat with custom design buyers, and coordinate orders.
        </p>
      </div>

      <div className="glass p-6 md:p-8 rounded-3xl border border-primary/20">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-primary/20 p-2 rounded-lg text-primary">
            <Calendar className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold">Appointments & Active Orders</h2>
        </div>
        
        <TailorBookingsList bookings={bookings} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass p-6 md:p-8 rounded-3xl border border-border">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Scissors className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Your Services Catalog</h2>
            </div>
            
            {services.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground bg-background/20 rounded-2xl border border-border">
                <p className="text-xs font-semibold">You haven't listed any tailoring services yet.</p>
              </div>
            ) : (
              <ServiceManager initialServices={services} />
            )}
            
            <AddServiceForm />
          </div>

          <div className="glass p-6 md:p-8 rounded-3xl border border-border">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Scissors className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Available Fabrics & Inventory</h2>
            </div>
            
            {fabrics.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground bg-background/20 rounded-2xl border border-border">
                <p className="text-xs font-semibold">You haven't added any premium fabrics yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fabrics.map((fab: any) => (
                  <div key={fab.id} className="p-4 rounded-xl border border-border bg-background/30 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-xs">{fab.name}</h3>
                      <p className="text-[10px] text-muted-foreground">{fab.material}</p>
                    </div>
                    <div className="font-bold text-xs text-primary">₹{fab.pricePerMeter.toFixed(0)} / m</div>
                  </div>
                ))}
              </div>
            )}
            
            <AddFabricForm />
          </div>

          <PortfolioManager />
        </div>

        <div className="lg:col-span-1 space-y-8 h-fit">
          <div className="glass p-6 md:p-8 rounded-3xl border border-border">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Atelier Settings</h2>
            </div>
            
            <ProfileForm initialData={tailorProfile} />
          </div>
        </div>
      </div>
    </div>
  );
}
