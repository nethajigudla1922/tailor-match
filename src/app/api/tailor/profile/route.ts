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

    const data = await req.json();
    
    const tailor = await prisma.tailorProfile.update({
      where: { userId: session.user.id as string },
      data: {
        shopName: data.shopName,
        address: data.address,
        operatingHours: data.operatingHours,
        travelRadius: parseInt(data.travelRadius) || 10,
        travelFee: parseFloat(data.travelFee) || 0.0,
        profilePicture: data.profilePicture || null,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
      }
    });

    return NextResponse.json(tailor);
  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
