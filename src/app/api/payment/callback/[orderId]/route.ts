import { NextRequest, NextResponse } from "next/server";
import { checkPaymentStatus } from "@/lib/phonepe";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
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
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
