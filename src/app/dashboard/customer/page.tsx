import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CustomerDashboardClient } from "./CustomerDashboardClient";
 
export const dynamic = 'force-dynamic';

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
  let customerProfile = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id as string },
    include: {
      user: true,
      measurements: true,
      bookings: {
        include: { 
          tailor: { include: { user: true } }, 
          service: true,
          services: true, // many-to-many selection
          payment: true
        },
        orderBy: { appointmentDate: "desc" }
      }
    }
  });

  if (!customerProfile) {
    customerProfile = await prisma.customerProfile.create({
      data: {
        userId: session.user.id as string,
        city: "",
        address: ""
      },
      include: {
        user: true,
        measurements: true,
        bookings: {
          include: { 
            tailor: { include: { user: true } }, 
            service: true,
            services: true,
            payment: true
          },
          orderBy: { appointmentDate: "desc" }
        }
      }
    });
  }
 
  const bookings = customerProfile?.bookings || [];
  const measurements = customerProfile?.measurements || [];
 
  return (
    <div className="container mx-auto px-4 py-12">
      <CustomerDashboardClient
        bookings={bookings}
        measurements={measurements}
        customerProfile={customerProfile}
        userName={session.user.name || "Customer"}
      />
    </div>
  );
}

