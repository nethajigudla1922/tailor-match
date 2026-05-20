import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tailorProfileId = searchParams.get("tailorProfileId");

    if (tailorProfileId) {
      const items = await prisma.portfolioItem.findMany({
        where: { tailorProfileId },
        orderBy: { createdAt: "desc" }
      });
      return NextResponse.json(items);
    }

    // Default to currently logged in tailor
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tailor = await prisma.tailorProfile.findUnique({
      where: { userId: session.user.id as string }
    });

    if (!tailor) {
      return NextResponse.json({ error: "Tailor profile not found" }, { status: 404 });
    }

    const items = await prisma.portfolioItem.findMany({
      where: { tailorProfileId: tailor.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET Tailor Portfolio Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role !== "TAILOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const tailor = await prisma.tailorProfile.findUnique({
      where: { userId: session.user.id as string }
    });

    if (!tailor) {
      return NextResponse.json({ error: "Tailor profile not found" }, { status: 404 });
    }

    const data = await req.json();
    const { image, title, description, serviceCategory } = data;

    if (!image || !title) {
      return NextResponse.json({ error: "Image and title are required fields" }, { status: 400 });
    }

    const newItem = await prisma.portfolioItem.create({
      data: {
        tailorProfileId: tailor.id,
        image,
        title,
        description: description || null,
        serviceCategory: serviceCategory || null
      }
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("POST Tailor Portfolio Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role !== "TAILOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const tailor = await prisma.tailorProfile.findUnique({
      where: { userId: session.user.id as string }
    });

    if (!tailor) {
      return NextResponse.json({ error: "Tailor profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("id");

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    // Verify it belongs to this tailor
    const item = await prisma.portfolioItem.findFirst({
      where: { id: itemId, tailorProfileId: tailor.id }
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found or unauthorized" }, { status: 404 });
    }

    await prisma.portfolioItem.delete({
      where: { id: itemId }
    });

    return NextResponse.json({ message: "Portfolio item deleted successfully" });
  } catch (error) {
    console.error("DELETE Tailor Portfolio Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
