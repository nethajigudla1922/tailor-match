import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customer = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id as string },
      include: { user: true }
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("GET Customer Profile Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, phone, address, profilePicture } = await req.json();

    // Check if email already exists (excluding self)
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: { email, NOT: { id: session.user.id } }
      });
      if (existingEmail) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      }
    }

    // Check if phone already exists (excluding self)
    if (phone) {
      const existingPhone = await prisma.user.findFirst({
        where: { phone, NOT: { id: session.user.id } }
      });
      if (existingPhone) {
        return NextResponse.json({ error: "Phone number already exists" }, { status: 400 });
      }
    }

    // Update User
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email: email || null,
        phone: phone || null
      }
    });

    // Update CustomerProfile
    const updatedProfile = await prisma.customerProfile.update({
      where: { userId: session.user.id },
      data: {
        address,
        profilePicture
      }
    });

    return NextResponse.json({ message: "Profile updated successfully", profile: updatedProfile });
  } catch (error) {
    console.error("POST Customer Profile Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
