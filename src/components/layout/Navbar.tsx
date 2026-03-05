"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="bg-[var(--brand-nav)] px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[var(--brand-nav-text)]">
          Tanuja&apos;s BatterHouse
        </Link>
        <button
          className="md:hidden text-[var(--brand-nav-text)]"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <div className={`${isOpen ? "block" : "hidden"} md:flex md:items-center md:gap-6 absolute md:static top-14 left-0 right-0 bg-[var(--brand-nav)] px-4 py-2 md:p-0 z-50`}>
          <Link
            href="/about"
            className="block py-1 text-[var(--brand-nav-text)] hover:text-white/80"
            aria-current={pathname === "/about" ? "page" : undefined}
            onClick={() => setIsOpen(false)}
          >
            About Us
          </Link>
          <Link
            href="/menu"
            className="block py-1 text-[var(--brand-nav-text)] hover:text-white/80"
            aria-current={pathname === "/menu" ? "page" : undefined}
            onClick={() => setIsOpen(false)}
          >
            Menu
          </Link>
          <Link
            href="/order"
            className="block py-1 md:ml-auto font-semibold text-[var(--brand-nav-text)] bg-[var(--brand-primary)] px-4 rounded-full hover:bg-[var(--brand-primary-hover)] transition-colors text-center mt-2 md:mt-0"
            aria-current={pathname === "/order" ? "page" : undefined}
            onClick={() => setIsOpen(false)}
          >
            Place an Order!
          </Link>
        </div>
      </div>
    </nav>
  );
}
