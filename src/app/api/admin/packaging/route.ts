import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AREA_LABELS } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get("order_date");

  const distinctDates = await prisma.order.findMany({
    select: { order_date: true },
    distinct: ["order_date"],
    orderBy: { order_date: "desc" },
  });

  const dates = distinctDates.map((d) => d.order_date.toISOString().split("T")[0]);
  const selectedDate = dateParam || dates[0] || new Date().toISOString().split("T")[0];

  const orders = await prisma.order.findMany({
    where: {
      order_date: new Date(selectedDate),
      is_paid: true,
    },
    include: {
      items: { include: { product: true } },
    },
  });

  return NextResponse.json({
    orders: orders.map((o) => ({
      order_id: o.order_id,
      name: o.name,
      address: o.address,
      area: o.area,
      area_display: AREA_LABELS[o.area] || o.area,
      order_date: o.order_date.toISOString().split("T")[0],
      price: Number(o.price),
      items: o.items.map((i) => ({
        name: i.product.name,
        quantity: Number(i.quantity),
        unit: i.product.unit,
      })),
    })),
    selectedDate,
    dates,
  });
}
