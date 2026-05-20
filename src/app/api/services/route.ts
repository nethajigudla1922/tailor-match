import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
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
    
    const service = await prisma.service.create({
      data: {
        tailorProfileId: tailor.id,
        name: data.name,
        category: data.category,
        occasion: data.occasion,
        price: parseFloat(data.price),
        description: data.description,
        estimatedDays: parseInt(data.estimatedDays) || null
      }
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("Service Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
