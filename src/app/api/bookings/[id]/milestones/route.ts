import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;

    // Retrieve booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        tailor: true,
        milestones: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify authorized party
    const isCustomer = booking.customer.userId === session.user.id;
    const isTailor = booking.tailor.userId === session.user.id;

    if (!isCustomer && !isTailor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(booking.milestones);
  } catch (error) {
    console.error("GET Booking Milestones Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;
    const data = await req.json();

    // Verify user is a tailor
    if ((session.user as any).role !== "TAILOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const tailor = await prisma.tailorProfile.findUnique({
      where: { userId: session.user.id as string }
    });

    if (!tailor) {
      return NextResponse.json({ error: "Tailor profile not found" }, { status: 404 });
    }

    // Verify booking belongs to this tailor
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, tailorId: tailor.id }
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found or unauthorized" }, { status: 404 });
    }

    const { milestoneId, title, description, image, isCompleted } = data;

    if (milestoneId) {
      // Update existing milestone
      const updatedMilestone = await prisma.bookingMilestone.update({
        where: { id: milestoneId },
        data: {
          title: title !== undefined ? title : undefined,
          description: description !== undefined ? description : undefined,
          image: image !== undefined ? image : undefined,
          isCompleted: isCompleted !== undefined ? isCompleted : undefined
        }
      });
      return NextResponse.json(updatedMilestone);
    } else {
      // Create new milestone
      if (!title) {
        return NextResponse.json({ error: "Milestone title is required" }, { status: 400 });
      }
      const newMilestone = await prisma.bookingMilestone.create({
        data: {
          bookingId,
          title,
          description: description || null,
          image: image || null,
          isCompleted: isCompleted || false
        }
      });
      return NextResponse.json(newMilestone, { status: 201 });
    }
  } catch (error) {
    console.error("POST Booking Milestones Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
