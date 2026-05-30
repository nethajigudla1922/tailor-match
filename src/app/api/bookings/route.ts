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

    // Must be a customer to book
    if ((session.user as any).role !== "CUSTOMER") {
      return NextResponse.json({ error: "Only customers can make bookings" }, { status: 403 });
    }

    // Get customer profile
    const customer = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id as string },
      include: { measurements: true }
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const { 
      tailorId, serviceId, serviceIds, fabricId, deliveryType, appointmentDate, appointmentTime, notes, referenceImage, totalPrice,
      neck, chest, waist, hips, inseam, sleeve, shoulder, armHole
    } = body;

    const tailor = await prisma.tailorProfile.findUnique({
      where: { id: tailorId }
    });

    if (!tailor) {
      return NextResponse.json({ error: "Tailor not found" }, { status: 404 });
    }

    const selectedServiceIds = serviceIds || (serviceId ? [serviceId] : []);
    if (selectedServiceIds.length === 0) {
      return NextResponse.json({ error: "Please select at least one service." }, { status: 400 });
    }

    let finalDistance: number | null = null;
    let finalPickupAddress: string | null = null;
    let finalPickupLatitude: number | null = null;
    let finalPickupLongitude: number | null = null;

    if (deliveryType === "HOME_VISIT") {
      const { pickupAddress, pickupLatitude, pickupLongitude } = body;
      if (!pickupAddress || pickupLatitude === undefined || pickupLongitude === undefined) {
        return NextResponse.json({ error: "Missing pickup location details for Home Visit." }, { status: 400 });
      }

      finalPickupAddress = pickupAddress;
      finalPickupLatitude = parseFloat(pickupLatitude);
      finalPickupLongitude = parseFloat(pickupLongitude);

      if (tailor.latitude && tailor.longitude) {
        const R = 6371; // Earth's radius in km
        const lat1 = tailor.latitude;
        const lon1 = tailor.longitude;
        const lat2 = finalPickupLatitude;
        const lon2 = finalPickupLongitude;
        
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        finalDistance = R * c;

        const maxRadius = tailor.travelRadius || 10;
        if (finalDistance > maxRadius) {
          return NextResponse.json({ 
            error: `Pickup location is too far. Distance is ${finalDistance.toFixed(1)} km, but this tailor only covers a radius of ${maxRadius} km.` 
          }, { status: 400 });
        }
      }
    }

    const defaultMeasurement = customer.measurements?.[0];

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        tailorId,
        serviceId: selectedServiceIds[0],
        services: {
          connect: selectedServiceIds.map((id: string) => ({ id }))
        },
        deliveryType,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        notes,
        referenceImage,
        pickupAddress: finalPickupAddress,
        pickupLatitude: finalPickupLatitude,
        pickupLongitude: finalPickupLongitude,
        distance: finalDistance,
        status: "PENDING",
        neck: neck !== undefined ? (neck === null ? null : parseFloat(neck)) : (defaultMeasurement?.neck || null),
        chest: chest !== undefined ? (chest === null ? null : parseFloat(chest)) : (defaultMeasurement?.chest || null),
        waist: waist !== undefined ? (waist === null ? null : parseFloat(waist)) : (defaultMeasurement?.waist || null),
        hips: hips !== undefined ? (hips === null ? null : parseFloat(hips)) : (defaultMeasurement?.hips || null),
        inseam: inseam !== undefined ? (inseam === null ? null : parseFloat(inseam)) : (defaultMeasurement?.inseam || null),
        sleeve: sleeve !== undefined ? (sleeve === null ? null : parseFloat(sleeve)) : (defaultMeasurement?.sleeve || null),
        shoulder: shoulder !== undefined ? (shoulder === null ? null : parseFloat(shoulder)) : (defaultMeasurement?.shoulder || null),
        armHole: armHole !== undefined ? (armHole === null ? null : parseFloat(armHole)) : (defaultMeasurement?.armHole || null)
      }
    });

    // Create a pending payment
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        totalAmount: totalPrice || 0,
        platformFee: (totalPrice || 0) * 0.05,
        tailorEarnings: (totalPrice || 0) * 0.95,
        status: "PENDING"
      }
    });

    return NextResponse.json({ message: "Booking created successfully", booking, payment }, { status: 201 });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "CUSTOMER" && role !== "TAILOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { bookingId, appointmentDate, appointmentTime, notes, referenceImage, deliveryType, neck, chest, waist, hips, inseam, sleeve, shoulder, armHole, status } = body;

    let booking;
    if (role === "CUSTOMER") {
      const customer = await prisma.customerProfile.findUnique({
        where: { userId: session.user.id as string }
      });
      if (!customer) return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
      
      booking = await prisma.booking.findFirst({
        where: { id: bookingId, customerId: customer.id }
      });
    } else {
      const tailor = await prisma.tailorProfile.findUnique({
        where: { userId: session.user.id as string }
      });
      if (!tailor) return NextResponse.json({ error: "Tailor profile not found" }, { status: 404 });
      
      booking = await prisma.booking.findFirst({
        where: { id: bookingId, tailorId: tailor.id }
      });
    }

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (role === "CUSTOMER" && booking.status !== "PENDING") {
      return NextResponse.json({ error: "Booking cannot be edited once accepted by the tailor" }, { status: 400 });
    }

    let updateData: any = {};
    if (role === "CUSTOMER") {
      updateData = {
        appointmentDate: appointmentDate ? new Date(appointmentDate) : undefined,
        appointmentTime: appointmentTime || undefined,
        notes: notes !== undefined ? notes : undefined,
        referenceImage: referenceImage !== undefined ? referenceImage : undefined,
        deliveryType: deliveryType || undefined,
        status: status === "CANCELLED" ? "CANCELLED" : undefined,
        customerUpdated: status !== "CANCELLED" ? true : undefined, // flag as customer updated if not a cancellation
      };
    } else {
      updateData = {
        neck: neck !== undefined ? (neck === null || neck === "" ? null : parseFloat(neck)) : undefined,
        chest: chest !== undefined ? (chest === null || chest === "" ? null : parseFloat(chest)) : undefined,
        waist: waist !== undefined ? (waist === null || waist === "" ? null : parseFloat(waist)) : undefined,
        hips: hips !== undefined ? (hips === null || hips === "" ? null : parseFloat(hips)) : undefined,
        inseam: inseam !== undefined ? (inseam === null || inseam === "" ? null : parseFloat(inseam)) : undefined,
        sleeve: sleeve !== undefined ? (sleeve === null || sleeve === "" ? null : parseFloat(sleeve)) : undefined,
        shoulder: shoulder !== undefined ? (shoulder === null || shoulder === "" ? null : parseFloat(shoulder)) : undefined,
        armHole: armHole !== undefined ? (armHole === null || armHole === "" ? null : parseFloat(armHole)) : undefined
      };
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData
    });

    return NextResponse.json({ message: "Booking updated successfully", booking: updatedBooking });
  } catch (error) {
    console.error("Booking edit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
