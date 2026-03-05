import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

  const categoryTotals: Record<string, { quantity: number; batter: number; unit: string }> = {
    "Idli/Dosa Batter": { quantity: 0, batter: 0, unit: "kg" },
    "Ragi Batter": { quantity: 0, batter: 0, unit: "kg" },
    "Steamed Idli": { quantity: 0, batter: 0, unit: "pieces" },
    "Ragi Idli": { quantity: 0, batter: 0, unit: "pieces" },
    "Sambar": { quantity: 0, batter: 0, unit: "pack" },
    "Peanut Chutney": { quantity: 0, batter: 0, unit: "pack" },
    "Onion Chutney": { quantity: 0, batter: 0, unit: "pack" },
    "Sambar Powder": { quantity: 0, batter: 0, unit: "gm" },
  };

  for (const order of orders) {
    for (const item of order.items) {
      const name = item.product.name;
      const qty = Number(item.quantity);

      if (name === "Steamed Idli") {
        categoryTotals["Steamed Idli"].quantity += qty;
        categoryTotals["Steamed Idli"].batter += qty / 20;
      } else if (name === "Ragi Idli") {
        categoryTotals["Ragi Idli"].quantity += qty;
        categoryTotals["Ragi Idli"].batter += qty / 20;
      } else if (name === "Idli/Dosa Batter") {
        categoryTotals["Idli/Dosa Batter"].quantity += qty;
        categoryTotals["Idli/Dosa Batter"].batter += qty;
      } else if (name === "Ragi Batter") {
        categoryTotals["Ragi Batter"].quantity += qty;
        categoryTotals["Ragi Batter"].batter += qty;
      } else if (name in categoryTotals) {
        categoryTotals[name].quantity += qty;
      }
    }
  }

  const totalIdliBatter =
    categoryTotals["Steamed Idli"].batter + categoryTotals["Idli/Dosa Batter"].batter;
  const totalRagiBatter =
    categoryTotals["Ragi Idli"].batter + categoryTotals["Ragi Batter"].batter;

  const riceForIdli = totalIdliBatter > 0 ? +(totalIdliBatter / 2.8).toFixed(2) : null;
  const riceForRagi = totalRagiBatter > 0 ? +(totalRagiBatter / 2.8).toFixed(2) : null;

  return NextResponse.json({
    categoryTotals,
    totalIdliBatter: totalIdliBatter || null,
    totalRagiBatter: totalRagiBatter || null,
    riceForIdli,
    riceForRagi,
    selectedDate,
    dates,
  });
}
