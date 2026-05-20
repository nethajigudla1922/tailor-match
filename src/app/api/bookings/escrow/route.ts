import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Auto-release scan run: Release any COMPLETED booking payment in ESCROW that was delivered over 7 days ago
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
      console.log(`Auto-released ${expiredPayments.length} expired escrow payments.`);
    }

    const body = await req.json();
    const { bookingId, action } = body; // action: "RELEASE" or "DISPUTE"

    if (!bookingId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Customer validation
    const customer = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id as string }
    });

    if (!customer) {
      return NextResponse.json({ error: "Unauthorized role" }, { status: 403 });
    }

    // Verify booking belongs to this customer
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        customerId: customer.id
      },
      include: { payment: true }
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!booking.payment) {
      return NextResponse.json({ error: "No payment linked to this booking" }, { status: 400 });
    }

    if (booking.payment.status !== "ESCROW") {
      return NextResponse.json({ error: "Payment is not in escrow" }, { status: 400 });
    }

    let newStatus = booking.payment.status;
    if (action === "RELEASE") {
      newStatus = "RELEASED";
    } else if (action === "DISPUTE") {
      newStatus = "DISPUTED";
    } else {
      return NextResponse.json({ error: "Invalid escrow action" }, { status: 400 });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: booking.payment.id },
      data: { status: newStatus }
    });

    return NextResponse.json({
      message: `Escrow payment successfully ${action === "RELEASE" ? "released" : "disputed"}.`,
      payment: updatedPayment
    });
  } catch (error) {
    console.error("Escrow action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
