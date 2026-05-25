import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "./AdminDashboardClient";
import { ShieldCheck } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  // Secure Administrative Check
  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  // 1. Fetch all registered Customer accounts and details
  const customersRaw = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      customerProfile: {
        include: {
          measurements: true,
          bookings: {
            include: {
              payment: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const totalCustomers = customersRaw.length;

  // 2. Fetch all registered Tailors and their profiles, services, bookings, and payments
  const tailorsRaw = await prisma.user.findMany({
    where: { role: "TAILOR" },
    include: {
      tailorProfile: {
        include: {
          services: true,
          bookings: {
            include: {
              payment: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // 3. Fetch all bookings count
  const totalBookings = await prisma.booking.count();

  // 4. Fetch general payment statistics (Platform volume & revenue)
  const paymentsSum = await prisma.payment.aggregate({
    _sum: {
      totalAmount: true,
      platformFee: true
    }
  });

  const totalVolume = paymentsSum._sum.totalAmount || 0;
  const totalRevenue = paymentsSum._sum.platformFee || 0;

  // Format dates and serialise for Client Component
  const tailors = tailorsRaw.map(t => ({
    id: t.id,
    name: t.name,
    email: t.email,
    createdAt: t.createdAt,
    tailorProfile: t.tailorProfile ? {
      id: t.tailorProfile.id,
      shopName: t.tailorProfile.shopName,
      bio: t.tailorProfile.bio,
      address: t.tailorProfile.address,
      city: t.tailorProfile.city,
      operatingHours: t.tailorProfile.operatingHours,
      travelRadius: t.tailorProfile.travelRadius,
      travelFee: t.tailorProfile.travelFee,
      isVerified: t.tailorProfile.isVerified,
      services: t.tailorProfile.services.map(svc => ({
        id: svc.id,
        name: svc.name,
        category: svc.category,
        occasion: svc.occasion,
        price: svc.price,
        description: svc.description,
        estimatedDays: svc.estimatedDays
      })),
      bookings: t.tailorProfile.bookings.map(b => ({
        id: b.id,
        status: b.status,
        serviceId: b.serviceId,
        payment: b.payment ? {
          id: b.payment.id,
          totalAmount: b.payment.totalAmount,
          platformFee: b.payment.platformFee,
          status: b.payment.status
        } : null
      }))
    } : null
  }));

  const customers = customersRaw.map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
    createdAt: c.createdAt,
    customerProfile: c.customerProfile ? {
      id: c.customerProfile.id,
      address: c.customerProfile.address,
      city: c.customerProfile.city,
      measurementsCount: c.customerProfile.measurements.length,
      bookings: c.customerProfile.bookings.map(b => ({
        id: b.id,
        status: b.status,
        payment: b.payment ? {
          id: b.payment.id,
          totalAmount: b.payment.totalAmount,
          platformFee: b.payment.platformFee,
          status: b.payment.status
        } : null
      }))
    } : null
  }));

  const stats = {
    totalCustomers,
    totalBookings,
    totalVolume,
    totalRevenue
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Premium Dashboard Title Bar */}
      <div className="flex items-center gap-2 mb-8 border-b border-border/40 pb-5">
        <div className="bg-primary/20 p-2.5 rounded-xl text-primary shadow-sm">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Super Admin Dashboard</h1>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Matchmaking Platform Security & Craftsmanship Monitoring Panel
          </p>
        </div>
      </div>

      <AdminDashboardClient tailors={tailors} customers={customers} stats={stats} />
    </div>
  );
}
