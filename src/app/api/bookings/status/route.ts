import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "TAILOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tailor = await prisma.tailorProfile.findUnique({
      where: { userId: session.user.id as string }
    });
    
    if (!tailor) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = await req.json();
    
    // Ensure the booking actually belongs to this tailor
    const booking = await prisma.booking.findFirst({
      where: {
        id: data.bookingId,
        tailorId: tailor.id
      }
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found or unauthorized" }, { status: 404 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: data.status !== undefined ? data.status : undefined,
        customerUpdated: data.acknowledgeUpdate === true ? false : undefined
      }
    });


    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Booking Status Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
