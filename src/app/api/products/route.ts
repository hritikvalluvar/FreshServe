import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { available: true },
    orderBy: { id: "asc" },
  });

  return NextResponse.json({ products });
}
