export default function ShippingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-6">Shipping Policy</h1>
      <div className="space-y-4">
        <Section title="1. Delivery Areas">
          We currently offer local delivery only in the Old Township, New Township, and Khore Kheri areas of Panipat Refinery Township. We do not offer shipping to other areas.
        </Section>
        <Section title="2. Order Processing">
          Orders are freshly prepared on the specified delivery date, ensuring top-notch quality and freshness. The preparation process begins early at <strong>5:00 AM</strong> and is completed by <strong>7:30 AM</strong>, ready for dispatch to customers.
        </Section>
        <Section title="3. Delivery Times">
          Deliveries are executed promptly and are completed within <strong>one hour</strong> after the orders are ready. We take pride in ensuring that all products reach our customers swiftly and in their freshest state. Please make sure someone is available to receive the delivery on the scheduled date to enjoy a seamless experience.
        </Section>
        <Section title="4. Shipping Costs">
          We charge a nominal fee of ₹10 on all orders to cover fuel and labor costs. Currently, we only offer delivery within Panipat Refinery Township.
        </Section>
        <Section title="5. Damaged or Spoilt Orders">
          If your order arrives damaged or spoiled, we will take full responsibility and provide a free replacement or refund. Please contact us within 3-4 hours of receiving your order to initiate the process.
        </Section>
        <Section title="6. Contact Us">
          If you have any questions regarding our shipping policy, please contact us at <a href="mailto:tanujabatterhouse@gmail.com" className="text-blue-600 hover:underline">tanujabatterhouse@gmail.com</a>.
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
