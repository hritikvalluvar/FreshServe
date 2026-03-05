export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-6">Contact Us</h1>
      <div className="bg-[var(--brand-card)] shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-center mb-6">We&apos;d Love to Hear From You!</h2>
        <div className="space-y-4">
          <div>
            <p className="font-semibold mb-1">Phone:</p>
            <a
              href="tel:+919253033586"
              className="inline-block bg-[var(--brand-primary)] text-white px-4 py-2 rounded hover:bg-[var(--brand-primary-hover)]"
            >
              Call Us: +91 92530 33586
            </a>
            <p className="mt-1 text-sm text-[var(--brand-muted)]">+91 92530 33586</p>
          </div>
          <div>
            <p className="font-semibold mb-1">WhatsApp:</p>
            <a
              href="https://wa.me/919253033586"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[var(--brand-success)] text-white px-4 py-2 rounded hover:opacity-90"
            >
              Chat with Us on WhatsApp
            </a>
          </div>
          <div>
            <p className="font-semibold mb-1">Address:</p>
            <a
              href="https://maps.google.com/?q=D+1049+Panipat+Refinery+Township+Panipat+Haryana+India+132140"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--brand-primary)] underline"
            >
              D 1049, Panipat Refinery Township, Panipat, Haryana, India, 132 140
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
