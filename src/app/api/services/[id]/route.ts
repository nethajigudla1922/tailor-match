import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: View full service details
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = await prisma.service.findUnique({
      where: { id },
      include: { tailor: { include: { user: true } } }
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("GET Service Detail Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Edit/Update service details
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const isAdmin = role === "ADMIN";
    const isTailor = role === "TAILOR";

    if (!isAdmin && !isTailor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let tailorId: string | null = null;
    if (isTailor) {
      const tailor = await prisma.tailorProfile.findUnique({
        where: { userId: session.user.id as string }
      });

      if (!tailor) {
        return NextResponse.json({ error: "Tailor profile not found" }, { status: 404 });
      }
      tailorId = tailor.id;
    }

    // Verify ownership
    const service = await prisma.service.findUnique({
      where: { id }
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (!isAdmin && service.tailorProfileId !== tailorId) {
      return NextResponse.json({ error: "Forbidden: You do not own this service" }, { status: 403 });
    }

    const data = await req.json();

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        occasion: data.occasion,
        price: parseFloat(data.price),
        description: data.description || null,
        estimatedDays: parseInt(data.estimatedDays) || null
      }
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("PUT Service Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Remove service
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const isAdmin = role === "ADMIN";
    const isTailor = role === "TAILOR";

    if (!isAdmin && !isTailor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let tailorId: string | null = null;
    if (isTailor) {
      const tailor = await prisma.tailorProfile.findUnique({
        where: { userId: session.user.id as string }
      });

      if (!tailor) {
        return NextResponse.json({ error: "Tailor profile not found" }, { status: 404 });
      }
      tailorId = tailor.id;
    }

    // Verify ownership
    const service = await prisma.service.findUnique({
      where: { id }
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (!isAdmin && service.tailorProfileId !== tailorId) {
      return NextResponse.json({ error: "Forbidden: You do not own this service" }, { status: 403 });
    }

    // Clean up related bookings to avoid foreign key constraints in sqlite
    await prisma.booking.deleteMany({
      where: { serviceId: id }
    });

    await prisma.service.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("DELETE Service Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
