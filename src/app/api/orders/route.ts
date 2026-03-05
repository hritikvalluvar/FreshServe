import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderFormSchema } from "@/lib/validators";
import { generateOrderId, calculateTotalPrice } from "@/lib/server-utils";
import Decimal from "decimal.js";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = orderFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, address, area, phone_number, items } = parsed.data;

    const orderAvailability = await prisma.orderAvailability.findFirst({
      orderBy: { id: "desc" },
    });

    if (!orderAvailability) {
      return NextResponse.json(
        { error: "No order date available" },
        { status: 400 }
      );
    }

    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.product_id) } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const priceItems = items.map((item) => {
      const product = productMap.get(item.product_id);
      if (!product) throw new Error(`Product ${item.product_id} not found`);
      return {
        quantity: item.quantity,
        productPrice: new Decimal(product.price.toString()),
        productQuantity: product.quantity,
      };
    });

    const totalPrice = calculateTotalPrice(priceItems);
    const orderId = await generateOrderId();

    await prisma.order.create({
      data: {
        order_id: orderId,
        name,
        address,
        area,
        phone_number,
        order_date: orderAvailability.date,
        price: totalPrice.toNumber(),
        items: {
          create: items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
        },
      },
    });

    return NextResponse.json({ orderId, price: totalPrice.toString() });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
