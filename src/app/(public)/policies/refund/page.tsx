export default function RefundPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-6">Refund Policy</h1>
      <div className="space-y-4">
        <Section title="1. Refunds for Damaged or Spoilt Orders">
          We offer products that may spoil if not refrigerated. If your order arrives damaged or spoiled, we take full responsibility and will offer a free replacement or refund. Please contact us within 3-4 hours of delivery to process your request.
        </Section>
        <Section title="2. Non-returnable Items">
          Due to the nature of our products (food), we cannot accept returns once the order has been fulfilled. We recommend checking your order thoroughly upon delivery.
        </Section>
        <Section title="3. Cancellation of Orders">
          If you wish to cancel an order, please contact us immediately after placing the order. Cancellations will only be processed before the order is confirmed and dispatched. After dispatch, we cannot cancel the order.
        </Section>
        <Section title="4. Refund Process">
          Once your refund request is approved, we will initiate the refund process. Please note that it may take 5-7 business days for the amount to reflect in your account, depending on the payment method used.
        </Section>
        <Section title="5. Contact Us">
          If you have any questions or need assistance with a refund, please contact us at <a href="mailto:tanujabatterhouse@gmail.com" className="text-blue-600 hover:underline">tanujabatterhouse@gmail.com</a>.
        </Section>
        <div className="bg-white shadow rounded-xl p-5">
          <h2 className="text-lg font-semibold text-gray-700">Last updated: November 10, 2024</h2>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white shadow rounded-xl p-5">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">{title}</h2>
      <p className="text-gray-500 leading-relaxed">{children}</p>
    </div>
  );
}
