export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-6">Terms and Conditions</h1>
      <div className="space-y-4">
        <Section title="1. General">
          By accessing or using our website, you agree to be bound by these terms. If you do not agree to these terms, please refrain from using our website.
        </Section>
        <Section title="2. Services">
          We offer local delivery of authentic South Indian catering products. Please note that products, pricing, and availability may vary, and we reserve the right to update them at any time without prior notice.
        </Section>
        <Section title="3. Orders and Payments">
          Orders can be placed directly through our website. All orders are subject to acceptance, availability, and confirmation of payment.
        </Section>
        <Section title="4. Refunds and Cancellations">
          We do not accept returns once an order is fulfilled. If there is an issue with an order, please contact us within 24 hours of receipt, and we will assist with a replacement or refund.
        </Section>
        <Section title="5. Limitations of Liability">
          We are not liable for any damages or losses resulting from the use of our products or website. Our liability is limited to the cost of the ordered product.
        </Section>
        <Section title="6. Contact Information">
          If you have any questions about these terms and conditions, please reach out to us at <a href="mailto:tanujabatterhouse@gmail.com" className="text-blue-600 hover:underline">tanujabatterhouse@gmail.com</a>.
        </Section>
        <Section title="7. Governing Law">
          These terms are governed by the laws of Haryana, India.
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
