"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin/shop", label: "Shop" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/kitchen", label: "Kitchen" },
  { href: "/admin/sorting", label: "Sorting" },
  { href: "/admin/packaging", label: "Packaging" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-[var(--brand-nav)] no-print">
      <div className="max-w-5xl mx-auto flex items-center justify-between py-2.5 px-4">
        <div className="flex items-center gap-1 flex-wrap">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2.5 rounded text-sm font-medium transition ${
                pathname === item.href
                  ? "bg-white/50 text-[var(--brand-nav-text)] font-bold"
                  : "text-[var(--brand-nav-text)] hover:bg-white/30"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="px-4 py-2.5 rounded text-sm font-medium text-[var(--brand-error)] hover:bg-[var(--brand-error)] hover:text-white transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
