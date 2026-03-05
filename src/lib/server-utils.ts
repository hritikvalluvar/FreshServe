import "server-only";
import { prisma } from "./prisma";
import Decimal from "decimal.js";

export async function generateOrderId(): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let orderId: string;

  do {
    orderId = Array.from({ length: 4 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  } while (
    await prisma.order.findUnique({ where: { order_id: orderId } })
  );

  return orderId;
}

export function calculateTotalPrice(
  items: { quantity: number; productPrice: Decimal; productQuantity: number }[]
): Decimal {
  let total = new Decimal(0);
  for (const item of items) {
    total = total.plus(
      new Decimal(item.quantity)
        .times(item.productPrice)
        .dividedBy(item.productQuantity)
    );
  }
  return total.toDecimalPlaces(2);
}
