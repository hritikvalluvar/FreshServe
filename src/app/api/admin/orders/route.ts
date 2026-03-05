import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPaymentStatus } from "@/lib/phonepe";
import { AREA_LABELS } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function checkAndCleanOrders(selectedDate: Date) {
  const unpaidOrders = await prisma.order.findMany({
    where: { order_date: selectedDate, is_paid: false },
  });

  for (const order of unpaidOrders) {
    try {
      const merchantTransactionId = `order_${order.order_id}`;
      const response = await checkPaymentStatus(merchantTransactionId);

      if (!response.success || response.data?.state === "FAILED") {
        await prisma.orderItem.deleteMany({ where: { order_id: order.order_id } });
        await prisma.order.delete({ where: { order_id: order.order_id } });
      } else if (response.data?.state === "COMPLETED") {
        await prisma.order.update({
          where: { order_id: order.order_id },
          data: {
            is_paid: true,
            transaction_id: response.data.transactionId || null,
          },
        });
      }
    } catch (error) {
      console.error(`Failed to check payment for order ${order.order_id}:`, error);
    }
  }
}

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get("order_date");

  const distinctDates = await prisma.order.findMany({
    select: { order_date: true },
    distinct: ["order_date"],
    orderBy: { order_date: "desc" },
  });

  const dates = distinctDates.map((d) => d.order_date.toISOString().split("T")[0]);
  const selectedDate = dateParam || dates[0] || new Date().toISOString().split("T")[0];

  await checkAndCleanOrders(new Date(selectedDate));

  const orders = await prisma.order.findMany({
    where: {
      order_date: new Date(selectedDate),
      is_paid: true,
    },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { created_at: "desc" },
  });

  const total = orders.reduce((sum, o) => sum + Number(o.price), 0);

  return NextResponse.json({
    orders: orders.map((o) => ({
      order_id: o.order_id,
      name: o.name,
      address: o.address,
      area: o.area,
      price: Number(o.price),
      items_summary: o.items
        .map((i) => `${i.product.name} (${Number(i.quantity)} ${i.product.unit})`)
        .join(", "),
      area_display: AREA_LABELS[o.area] || o.area,
    })),
    total,
    selectedDate,
    dates,
  });
}
