"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit: string;
  price: string;
  product_quantity: number;
  item_total: string;
}

function toCamelCase(str: string): string {
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export default function ConfirmOrderPage() {
  const router = useRouter();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [grandTotal, setGrandTotal] = useState("0.00");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [addressWarning, setAddressWarning] = useState(false);
  const [phoneStatus, setPhoneStatus] = useState<"valid" | "invalid" | "">("");
  const [formError, setFormError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedItems = sessionStorage.getItem("orderItems");
    const storedTotal = sessionStorage.getItem("grandTotal");
    if (!storedItems || !storedTotal) {
      router.push("/order");
      return;
    }
    setItems(JSON.parse(storedItems));
    setGrandTotal(storedTotal);
    setReady(true);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address,
          area,
          phone_number: phone,
          items: items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const payRes = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: data.orderId }),
      });

      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.error);

      sessionStorage.removeItem("orderItems");
      sessionStorage.removeItem("grandTotal");

      window.location.href = payData.redirectUrl;
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "An error occurred");
      setSubmitting(false);
    }
  };

  if (!ready) {
    return <div className="text-center py-20 text-[var(--brand-muted)]">Loading order details...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-6">Order Summary</h1>

      <h2 className="font-semibold mb-2">Your Selected Items:</h2>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Product Name</th>
              <th className="border p-2 text-left">Price per Unit (₹)</th>
              <th className="border p-2 text-left">Quantity</th>
              <th className="border p-2 text-left">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.product_id}>
                <td className="border p-2">{item.product_name}</td>
                <td className="border p-2">₹{item.price}</td>
                <td className="border p-2">
                  {item.quantity} {item.unit}
                </td>
                <td className="border p-2">₹{item.item_total}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={3} className="border p-2 text-right font-bold">
                Total Price:
              </td>
              <td className="border p-2 font-bold">₹{grandTotal}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {formError && (
        <div role="alert" className="bg-red-50 border border-[var(--brand-error)] text-[var(--brand-error)] px-4 py-3 rounded mb-4">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block font-medium mb-1">Full Name</label>
          <input
            required
            type="text"
            id="name"
            autoComplete="name"
            placeholder="Your Name"
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(toCamelCase(e.target.value))}
          />
        </div>

        <div>
          <label htmlFor="address" className="block font-medium mb-1">House Number</label>
          <input
            required
            type="text"
            id="address"
            autoComplete="address-line1"
            placeholder="example: D 1049"
            className={`w-full border rounded px-3 py-2 ${addressWarning ? "border-[var(--brand-error)]" : ""}`}
            value={address}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              setAddress(val);
              setAddressWarning(val.length > 20);
            }}
          />
          {addressWarning && (
            <small className="text-[var(--brand-error)]">Enter only quarter type and quarter number, e.g., &quot;D 1049&quot;.</small>
          )}
        </div>

        <div>
          <label htmlFor="area" className="block font-medium mb-1">Select Area</label>
          <select
            required
            id="area"
            autoComplete="address-level2"
            className="w-full border rounded px-3 py-2"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          >
            <option value="">Choose Area</option>
            <option value="NT">New Township</option>
            <option value="OT">Old Township</option>
            <option value="KK">Khora Kheri</option>
          </select>
        </div>

        <div>
          <label htmlFor="phone" className="block font-medium mb-1">Phone Number</label>
          <input
            required
            type="tel"
            id="phone"
            autoComplete="tel"
            pattern="[6-9][0-9]{9}"
            placeholder="10-digit Mobile Number"
            className={`w-full border rounded px-3 py-2 ${phoneStatus === "invalid" ? "border-[var(--brand-error)]" : phoneStatus === "valid" ? "border-[var(--brand-success)]" : ""}`}
            value={phone}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
              setPhone(val);
              if (val.length === 10 && /^[6-9]/.test(val)) setPhoneStatus("valid");
              else if (val.length === 10) setPhoneStatus("invalid");
              else setPhoneStatus("");
            }}
          />
          {phoneStatus === "invalid" && (
            <small className="text-[var(--brand-error)]">Enter a valid Indian mobile number starting with 6-9.</small>
          )}
          {phoneStatus === "valid" && (
            <small className="text-[var(--brand-success)]">Correct phone number.</small>
          )}
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? "Processing..." : "Place Order"}
        </Button>
      </form>
    </div>
  );
}
