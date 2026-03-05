import { NextRequest, NextResponse } from "next/server";
import { initiatePayment } from "@/lib/phonepe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { order_id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const amount = Number(order.price);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
    const merchantTransactionId = `order_${orderId}`;
    const callbackUrl = `${baseUrl}/api/payment/callback/${orderId}`;
    const redirectUrl = `${baseUrl}/order/success/${orderId}`;

    const response = await initiatePayment({
      merchantTransactionId,
      amount,
      callbackUrl,
      redirectUrl,
    });

    if (response.success) {
      const payPageUrl =
        response.data?.instrumentResponse?.redirectInfo?.url;
      return NextResponse.json({ redirectUrl: payPageUrl });
    }

    return NextResponse.json(
      { error: response.message || "Payment initiation failed" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
