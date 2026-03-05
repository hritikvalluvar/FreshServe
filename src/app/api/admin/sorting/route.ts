import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DESIRED_ORDER = [
  "Idli/Dosa Batter",
  "Ragi Batter",
  "Steamed Idli",
  "Ragi Idli",
  "Sambar",
  "Peanut Chutney",
  "Onion Chutney",
  "Sambar Powder",
];

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

  const categorySummary: Record<string, Record<string, number>> = {};

  for (const order of orders) {
    for (const item of order.items) {
      const category = item.product.name;
      const qty = Number(item.quantity);
      const unit = item.product.unit;
      const subcategory = `${qty} \u00d7 ${unit}`;

      if (!categorySummary[category]) categorySummary[category] = {};
      categorySummary[category][subcategory] =
        (categorySummary[category][subcategory] || 0) + 1;
    }
  }

  // Sort by desired order
  const sortedSummary: Record<string, Record<string, number>> = {};
  for (const cat of DESIRED_ORDER) {
    if (categorySummary[cat]) sortedSummary[cat] = categorySummary[cat];
  }

  return NextResponse.json({
    categorySummary: sortedSummary,
    selectedDate,
    dates,
  });
}
