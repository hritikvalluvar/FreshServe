"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";

interface Product {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  price: string;
  quantity: number;
  unit: string;
  available: boolean;
}

function getStep(name: string): number {
  if (name === "Sambar" || name === "Peanut Chutney" || name === "Onion Chutney") return 1;
  if (name === "Sambar Powder") return 100;
  if (name === "Steamed Idli" || name === "Ragi Idli") return 5;
  if (name === "Idli/Dosa Batter" || name === "Ragi Batter") return 0.5;
  return 1;
}

export default function OrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/shop")
      .then((res) => res.json())
      .then((data) => {
        if (!data.shopOpen || !data.gateOpen) {
          router.replace("/closed");
          return;
        }
        return fetch("/api/products");
      })
      .then((res) => {
        if (!res) return;
        if (!res.ok) throw new Error("Failed to load products");
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setProducts(data.products || []);
        const initial: Record<number, number> = {};
        (data.products || []).forEach((p: Product) => {
          initial[p.id] = 0;
        });
        setQuantities(initial);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [router]);

  const increment = (id: number, name: string) => {
    const step = getStep(name);
    setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 0) + step }));
  };

  const decrement = (id: number, name: string) => {
    const step = getStep(name);
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) - step),
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    products.forEach((p) => {
      const qty = quantities[p.id] || 0;
      total += (qty * parseFloat(p.price)) / p.quantity;
    });
    return total;
  };

  const handleProceed = () => {
    const total = calculateTotal();
    if (total < 100) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    const selectedItems = products
      .filter((p) => (quantities[p.id] || 0) > 0)
      .map((p) => ({
        product_id: p.id,
        product_name: p.name,
        quantity: quantities[p.id],
        unit: p.unit,
        price: p.price,
        product_quantity: p.quantity,
        item_total: ((quantities[p.id] * parseFloat(p.price)) / p.quantity).toFixed(2),
      }));

    sessionStorage.setItem("orderItems", JSON.stringify(selectedItems));
    sessionStorage.setItem("grandTotal", total.toFixed(2));
    router.push("/order/confirm");
  };

  if (loading) {
    return <div className="text-center py-20 text-[var(--brand-muted)]">Loading products...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--brand-error)] mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-[var(--brand-muted)]">
        No products available right now.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-6">Place Your Order</h1>
      <div className="overflow-auto max-h-[calc(80vh-150px)]">
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="border border-gray-200 rounded-lg p-4 flex flex-row justify-between items-center bg-[var(--brand-card)]"
            >
              <div className="flex flex-col flex-1">
                {product.image_url && (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    width={100}
                    height={100}
                    className="rounded-full mb-2 object-cover"
                    style={{ width: 100, height: 100 }}
                  />
                )}
                <h2 className="font-bold">{product.name}</h2>
                <p className="text-sm text-[var(--brand-muted)]">{product.description}</p>
                <p className="text-sm">
                  <strong>₹{product.price}</strong> per {product.quantity} {product.unit}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 ml-4">
                <label className="text-sm text-[var(--brand-muted)]">Quantity</label>
                <div className="flex items-center gap-1 mb-1">
                  <input
                    type="text"
                    readOnly
                    value={quantities[product.id] || 0}
                    className="w-16 text-center border rounded py-1"
                  />
                  <span className="text-sm text-[var(--brand-muted)]">{product.unit}</span>
                </div>
                <button
                  type="button"
                  aria-label={`Increase ${product.name} quantity`}
                  onClick={() => increment(product.id, product.name)}
                  className="bg-[var(--brand-success)] text-white text-2xl px-4 py-1 rounded hover:opacity-90"
                >
                  +
                </button>
                <button
                  type="button"
                  aria-label={`Decrease ${product.name} quantity`}
                  onClick={() => decrement(product.id, product.name)}
                  className="bg-[var(--brand-error)] text-white text-2xl px-4 py-1 rounded hover:opacity-90"
                >
                  −
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center mt-6">
        <Button onClick={handleProceed} className="text-lg px-8 py-3">
          Proceed
        </Button>
      </div>
      {showAlert && (
        <div role="alert" className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-orange-50 border border-[var(--brand-warning)] text-[var(--brand-warning)] px-4 py-2 rounded z-50">
          Minimum order should be ₹100.
        </div>
      )}
    </div>
  );
}
