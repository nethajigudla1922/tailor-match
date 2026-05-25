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

    // Find the tailor's user record and profile
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      include: { tailorProfile: true }
    });

    if (!userToDelete) {
      return NextResponse.json({ error: "Tailor user not found" }, { status: 404 });
    }

    if (userToDelete.role !== "TAILOR") {
      return NextResponse.json({ error: "User is not a tailor" }, { status: 400 });
    }

    // 1. Manually clean up Bookings to avoid FK constraint issues in sqlite
    if (userToDelete.tailorProfile) {
      await prisma.booking.deleteMany({
        where: { tailorId: userToDelete.tailorProfile.id }
      });
    }

    // 2. Delete the user (which cascades to TailorProfile, Services, Fabrics, Reviews, etc.)
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Tailor account and all related data successfully deleted" });
  } catch (error) {
    console.error("Admin Delete Tailor Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
