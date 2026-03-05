import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { shopActionSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  const shop = await prisma.shopClosed.findFirst();
  const gate = await prisma.gateClosed.findFirst();
  const orderAvailability = await prisma.orderAvailability.findFirst({
    orderBy: { id: "desc" },
  });

  return NextResponse.json({
    shopOpen: shop?.is_shop_open ?? false,
    gateOpen: gate?.is_collecting_orders ?? false,
    orderDate: orderAvailability?.date ?? null,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = shopActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { action, order_date } = parsed.data;

    if (action === "open_shop" && order_date) {
      await prisma.shopClosed.upsert({
        where: { id: 1 },
        update: { is_shop_open: true },
        create: { id: 1, is_shop_open: true },
      });
      await prisma.gateClosed.upsert({
        where: { id: 1 },
        update: { is_collecting_orders: true },
        create: { id: 1, is_collecting_orders: true },
      });
      await prisma.orderAvailability.deleteMany();
      await prisma.orderAvailability.create({
        data: { date: new Date(order_date) },
      });
    } else if (action === "close_shop") {
      await prisma.shopClosed.upsert({
        where: { id: 1 },
        update: { is_shop_open: false },
        create: { id: 1, is_shop_open: false },
      });
      await prisma.gateClosed.upsert({
        where: { id: 1 },
        update: { is_collecting_orders: false },
        create: { id: 1, is_collecting_orders: false },
      });
      await prisma.orderAvailability.deleteMany();
    } else if (action === "close_gate") {
      await prisma.gateClosed.upsert({
        where: { id: 1 },
        update: { is_collecting_orders: false },
        create: { id: 1, is_collecting_orders: false },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Shop action error:", error);
    return NextResponse.json({ error: "Failed to update shop status" }, { status: 500 });
  }
}
