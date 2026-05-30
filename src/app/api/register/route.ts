import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, role, phone } = await req.json();

    if ((!email && !phone) || !password) {
      return NextResponse.json({ error: "Email or Phone Number, and Password are required" }, { status: 400 });
    }

    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email }
      });
      if (existingEmail) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      }
    }

    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone }
      });
      if (existingPhone) {
        return NextResponse.json({ error: "Phone number already exists" }, { status: 400 });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userRole = role === "TAILOR" ? "TAILOR" : "CUSTOMER";

    const user = await prisma.user.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        passwordHash,
        role: userRole,
      }
    });

    // Create the associated profile based on role
    if (userRole === "TAILOR") {
      await prisma.tailorProfile.create({
        data: {
          userId: user.id
        }
      });
    } else {
      await prisma.customerProfile.create({
        data: {
          userId: user.id
        }
      });
    }

    return NextResponse.json({ message: "User created successfully", userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
