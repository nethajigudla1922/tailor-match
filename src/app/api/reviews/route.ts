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

    if ((session.user as any).role !== "CUSTOMER") {
      return NextResponse.json({ error: "Only customers can submit reviews" }, { status: 403 });
    }

    const body = await req.json();
    const { tailorId, rating, comment, image } = body;

    if (!tailorId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating or tailor profile ID" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        tailorProfileId: tailorId,
        authorId: session.user.id as string,
        rating: parseInt(rating),
        comment: comment || "",
        image: image || null,
      }
    });

    return NextResponse.json({ message: "Review submitted successfully", review }, { status: 201 });
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
