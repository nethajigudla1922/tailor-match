import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    // Administrative check
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the customer's user record and profile
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      include: { customerProfile: true }
    });

    if (!userToDelete) {
      return NextResponse.json({ error: "Customer user not found" }, { status: 404 });
    }

    if (userToDelete.role !== "CUSTOMER") {
      return NextResponse.json({ error: "User is not a customer" }, { status: 400 });
    }

    // 1. Manually clean up Reviews authored by this customer to avoid FK constraint issues in sqlite
    await prisma.review.deleteMany({
      where: { authorId: id }
    });

    // 2. Manually clean up Bookings where the customer is the buyer
    if (userToDelete.customerProfile) {
      await prisma.booking.deleteMany({
        where: { customerId: userToDelete.customerProfile.id }
      });
    }

    // 3. Delete the user (which cascades to CustomerProfile, Measurements, etc.)
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Customer account and all related data successfully deleted" });
  } catch (error) {
    console.error("Admin Delete Customer Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
