import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Simulate updating the payment to ESCROW status
    const payment = await prisma.payment.update({
      where: { bookingId: data.bookingId },
      data: { status: "ESCROW" }
    });

    return NextResponse.json(payment);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
