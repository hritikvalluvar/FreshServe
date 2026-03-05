import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[var(--brand-nav)] text-[var(--brand-nav-text)] text-sm mt-auto">
      <div className="max-w-7xl mx-auto text-center py-4 px-4">
        <p className="mb-2">&copy; {new Date().getFullYear()} Tanuja&apos;s BatterHouse</p>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          <Link href="/" className="font-medium hover:underline">Home</Link>
          <Link href="/contact" className="font-medium hover:underline">Contact</Link>
          <Link href="/policies/terms" className="font-medium hover:underline">Terms and Conditions</Link>
          <Link href="/policies/privacy" className="font-medium hover:underline">Privacy Policy</Link>
          <Link href="/policies/refund" className="font-medium hover:underline">Refund Policy</Link>
          <Link href="/policies/shipping" className="font-medium hover:underline">Shipping Policy</Link>
        </nav>
      </div>
    </footer>
  );
}
