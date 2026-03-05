export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-6">Privacy Policy</h1>
      <div className="space-y-4">
        <Section title="SECTION 1 - WHAT DO WE DO WITH YOUR INFORMATION?">
          <p>When you purchase something from our store, as part of the buying and selling process, we collect the personal information you give us such as your name, address, and email address.</p>
          <p>When you browse our store, we also automatically receive your computer&apos;s internet protocol (IP) address in order to provide us with information that helps us learn about your browser and operating system.</p>
        </Section>
        <Section title="SECTION 2 - CONSENT">
          <p><strong>How do you get my consent?</strong></p>
          <p>When you provide us with personal information to complete a transaction, verify your credit card, place an order, arrange for a delivery or return a purchase, we imply that you consent to our collecting it and using it for that specific reason only.</p>
          <p>If we ask for your personal information for a secondary reason, like marketing, we will either ask you directly for your expressed consent, or provide you with an opportunity to say no.</p>
        </Section>
        <Section title="SECTION 3 - DISCLOSURE">
          We may disclose your personal information if we are required by law to do so or if you violate our Terms of Service.
        </Section>
        <Section title="SECTION 4 - PAYMENT">
          <p>We use PhonePe for processing payments. We/PhonePe do not store your card data on their servers. The data is encrypted through the Payment Card Industry Data Security Standard (PCI-DSS) when processing payment.</p>
        </Section>
        <Section title="SECTION 5 - THIRD-PARTY SERVICES">
          In general, the third-party providers used by us will only collect, use, and disclose your information to the extent necessary to allow them to perform the services they provide to us.
        </Section>
        <Section title="SECTION 6 - SECURITY">
          To protect your personal information, we take reasonable precautions and follow industry best practices to make sure it is not inappropriately lost, misused, accessed, disclosed, altered, or destroyed.
        </Section>
        <Section title="SECTION 7 - COOKIES">
          We use cookies to maintain the session of your user. It is not used to personally identify you on other websites.
        </Section>
        <Section title="SECTION 8 - AGE OF CONSENT">
          By using this site, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site.
        </Section>
        <Section title="SECTION 9 - CHANGES TO THIS PRIVACY POLICY">
          We reserve the right to modify this privacy policy at any time, so please review it frequently. Changes and clarifications will take effect immediately upon their posting on the website.
        </Section>
        <Section title="QUESTIONS AND CONTACT INFORMATION">
          <p>If you would like to: access, correct, amend or delete any personal information we have about you, register a complaint, or simply want more information, contact our Privacy Compliance Officer at <a href="mailto:hritikvalluvar@gmail.com" className="text-blue-600 hover:underline">hritikvalluvar@gmail.com</a> or by mail at:</p>
          <p>Hritik Valluvar, D 1049, Panipat Refinery Township, Panipat, Haryana, 132 140, India</p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white shadow rounded-xl p-5">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">{title}</h2>
      <div className="text-gray-500 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}
