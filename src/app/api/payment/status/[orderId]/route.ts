import { NextRequest, NextResponse } from "next/server";
import { checkPaymentStatus } from "@/lib/phonepe";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { order_id: orderId },
      select: { is_paid: true },
    });

    if (order?.is_paid) {
      return NextResponse.json({ paid: true });
    }

    const merchantTransactionId = `order_${orderId}`;
    const response = await checkPaymentStatus(merchantTransactionId);

    if (response.success && response.data?.state === "COMPLETED") {
      await prisma.order.update({
        where: { order_id: orderId },
        data: {
          is_paid: true,
          transaction_id: response.data.transactionId || null,
        },
      });
      return NextResponse.json({ paid: true });
    }

    return NextResponse.json({ paid: false, state: response.data?.state });
  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}
