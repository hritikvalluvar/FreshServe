import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Button from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const gate = await prisma.gateClosed.findFirst();
  const shop = await prisma.shopClosed.findFirst();
  const orderAvailability = await prisma.orderAvailability.findFirst({
    orderBy: { id: "desc" },
  });

  const isOpen = shop?.is_shop_open && gate?.is_collecting_orders;
  const orderDate = orderAvailability?.date;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome to Tanuja&apos;s BatterHouse</h1>
        <p className="text-lg text-[var(--brand-muted)]">Your favorite spot for authentic South Indian flavors.</p>
      </div>
      <div className="max-w-md mx-auto bg-[var(--brand-card)] shadow rounded-2xl p-6 text-center">
        {isOpen && orderDate ? (
          <>
            <h2 className="text-xl font-bold text-[var(--brand-success)] mb-3">We are accepting orders for</h2>
            <h3 className="text-lg text-[var(--brand-primary)]">{formatDate(orderDate)}</h3>
            <div className="mt-4">
              <Button href="/order" className="text-lg">Order Now</Button>
            </div>
            <p className="mt-3 text-[var(--brand-muted)] italic">Minimum Order: ₹100</p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-[var(--brand-error)] mb-3">We are not accepting orders</h2>
            <p className="text-[var(--brand-muted)]">
              Please <Link href="/contact" className="text-[var(--brand-primary)] underline">check back later</Link>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
