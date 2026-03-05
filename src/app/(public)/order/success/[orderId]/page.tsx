import Link from "next/link";
import { checkPaymentStatus } from "@/lib/phonepe";
import { prisma } from "@/lib/prisma";
import Button from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const merchantTransactionId = `order_${orderId}`;

  let success = false;
  let errorMessage = "";

  try {
    const order = await prisma.order.findUnique({
      where: { order_id: orderId },
      select: { is_paid: true },
    });

    if (order?.is_paid) {
      success = true;
    } else {
      const response = await checkPaymentStatus(merchantTransactionId);

      if (response.success && response.data?.state === "COMPLETED") {
        await prisma.order.update({
          where: { order_id: orderId },
          data: {
            is_paid: true,
            transaction_id: response.data.transactionId || null,
          },
        });
        success = true;
      } else {
        errorMessage = "Payment failed or invalid status.";
      }
    }
  } catch {
    errorMessage = "An error occurred while verifying the payment.";
  }

  if (!success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <div className="bg-[var(--brand-card)] shadow-lg rounded-xl p-8">
          <h1 className="text-2xl font-bold text-[var(--brand-error)] mb-3">Payment Failed</h1>
          <p className="text-[var(--brand-muted)] mb-6">{errorMessage}</p>
          <div className="flex justify-center gap-3">
            <Button href={`/order/success/${orderId}`}>Try Again</Button>
            <Button href="/" variant="secondary">Go Home</Button>
          </div>
        </div>
      </div>
    );
  }

  const order = await prisma.order.findUnique({
    where: { order_id: orderId },
    include: { items: { include: { product: true } } },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-center">
      <div className="bg-[var(--brand-card)] shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-bold text-[var(--brand-success)] mb-3">Payment Successful!</h1>
        <p className="text-lg mb-4">
          Your order <strong>#{orderId}</strong> has been successfully paid.
        </p>
        {order && (
          <div className="text-left bg-gray-50 rounded-lg p-4 mb-6 text-sm">
            <p><strong>Name:</strong> {order.name}</p>
            <p><strong>Address:</strong> {order.address}</p>
            <p className="mt-2 font-semibold">Items:</p>
            <ul className="list-disc list-inside">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.product.name} ({Number(item.quantity)} {item.product.unit})
                </li>
              ))}
            </ul>
            <p className="mt-2 font-bold">Total: ₹{Number(order.price)}</p>
          </div>
        )}
        <p className="text-[var(--brand-muted)] mb-8">
          Thank you for your purchase! Your order is now being processed.
        </p>
        <Button href="/" className="text-lg px-6 py-3">Go Home</Button>
      </div>
    </div>
  );
}
