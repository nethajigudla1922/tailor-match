import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) {
      return NextResponse.json({ error: "Missing booking ID" }, { status: 400 });
    }

    // Verify booking belongs to this user (either customer or tailor)
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        tailor: true
      }
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isCustomerOwner = booking.customer.userId === session.user.id;
    const isTailorOwner = booking.tailor.userId === session.user.id;

    if (!isCustomerOwner && !isTailorOwner) {
      return NextResponse.json({ error: "Unauthorized access to chat" }, { status: 403 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { bookingId },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Chat GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, text } = body;

    if (!bookingId || !text || !text.trim()) {
      return NextResponse.json({ error: "Missing booking ID or text" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        tailor: true
      }
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isCustomer = booking.customer.userId === session.user.id;
    const isTailor = booking.tailor.userId === session.user.id;

    if (!isCustomer && !isTailor) {
      return NextResponse.json({ error: "Unauthorized to send messages in this chat" }, { status: 403 });
    }

    const senderRole = isCustomer ? "CUSTOMER" : "TAILOR";

    const message = await prisma.chatMessage.create({
      data: {
        bookingId,
        senderRole,
        text: text.trim()
      }
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Chat POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
