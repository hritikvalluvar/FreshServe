import Image from "next/image";
import { prisma } from "@/lib/prisma";
import Button from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const products = await prisma.product.findMany({ orderBy: { id: "asc" } });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-6">Menu</h1>
      {products.length === 0 ? (
        <p className="text-center text-[var(--brand-muted)]">No menu items available right now.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-[var(--brand-card)] shadow rounded-lg overflow-hidden">
              {product.image_url && (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="font-bold text-lg">{product.name}</h2>
                <p className="text-[var(--brand-muted)] text-sm">{product.description}</p>
                <p className="mt-2">
                  <strong>₹{product.price.toString()}</strong> per {product.quantity} {product.unit}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="text-center mt-6">
        <Button href="/order" className="text-lg px-8 py-3">Order Now</Button>
      </div>
    </div>
  );
}
