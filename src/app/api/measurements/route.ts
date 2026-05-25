import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customer = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id as string }
    });
    
    if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = await req.json();
    const name = data.name?.trim() || "Default Fit";

    const existing = await prisma.measurement.findFirst({
      where: {
        customerProfileId: customer.id,
        name: name
      }
    });

    let measurement;
    if (existing) {
      measurement = await prisma.measurement.update({
        where: { id: existing.id },
        data: {
          neck: parseFloat(data.neck) || null,
          chest: parseFloat(data.chest) || null,
          waist: parseFloat(data.waist) || null,
          hips: parseFloat(data.hips) || null,
          inseam: parseFloat(data.inseam) || null,
          sleeve: parseFloat(data.sleeve) || null,
          shoulder: parseFloat(data.shoulder) || null,
          armHole: parseFloat(data.armHole) || null,
        }
      });
    } else {
      measurement = await prisma.measurement.create({
        data: {
          customerProfileId: customer.id,
          name: name,
          neck: parseFloat(data.neck) || null,
          chest: parseFloat(data.chest) || null,
          waist: parseFloat(data.waist) || null,
          hips: parseFloat(data.hips) || null,
          inseam: parseFloat(data.inseam) || null,
          sleeve: parseFloat(data.sleeve) || null,
          shoulder: parseFloat(data.shoulder) || null,
          armHole: parseFloat(data.armHole) || null,
        }
      });
    }

    return NextResponse.json(measurement);
  } catch (error) {
    console.error("Measurement Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customer = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id as string },
      include: { measurements: true }
    });

    if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Return the list of all named measurements
    return NextResponse.json(customer.measurements || []);
  } catch (error) {
    console.error("GET Measurements Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customer = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id as string }
    });

    if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing measurement ID" }, { status: 400 });
    }

    // Verify ownership before deleting
    const existing = await prisma.measurement.findFirst({
      where: {
        id: id,
        customerProfileId: customer.id
      }
    });

    if (!existing) {
      return NextResponse.json({ error: "Measurement profile not found" }, { status: 404 });
    }

    await prisma.measurement.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: "Sizing profile deleted successfully" });
  } catch (error) {
    console.error("DELETE Measurement Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
