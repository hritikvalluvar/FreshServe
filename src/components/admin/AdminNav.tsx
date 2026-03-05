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
    <div className="bg-gray-100 border-b border-gray-300 no-print">
      <div className="flex items-center justify-center gap-2 py-3 px-4 flex-wrap">
        {navItems.map((item, i) => (
          <span key={item.href} className="flex items-center gap-2">
            {i > 0 && <span className="text-gray-300 text-lg">|</span>}
            <Link
              href={item.href}
              className={`px-3 py-1.5 rounded text-sm transition ${
                pathname === item.href
                  ? "bg-blue-600 text-white"
                  : "text-blue-600 hover:bg-blue-600 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          </span>
        ))}
        <span className="text-gray-300 text-lg">|</span>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="px-3 py-1.5 rounded text-sm text-red-600 hover:bg-red-600 hover:text-white transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
