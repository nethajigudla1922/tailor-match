import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tailorId: string }> }
) {
  try {
    const { tailorId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tailor = await prisma.tailorProfile.findUnique({
      where: { id: tailorId }
    });

    if (!tailor) {
      return NextResponse.json({ error: "Tailor not found" }, { status: 404 });
    }

    const updatedTailor = await prisma.tailorProfile.update({
      where: { id: tailorId },
      data: {
        isVerified: !tailor.isVerified
      }
    });

    return NextResponse.json(updatedTailor);
  } catch (error) {
    console.error("Admin Verify Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
