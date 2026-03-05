"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

export default function ShopManagementPage() {
  const [shopOpen, setShopOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [orderDate, setOrderDate] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/shop");
      if (!res.ok) throw new Error("Failed to fetch shop status");
      const data = await res.json();
      setShopOpen(data.shopOpen);
      setGateOpen(data.gateOpen);
      setOrderDate(data.orderDate);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleAction = async (action: string) => {
    if (action === "close_shop" && !window.confirm("Are you sure you want to close the shop?")) return;
    if (action === "close_gate" && !window.confirm("Are you sure you want to close the gate for orders?")) return;

    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, order_date: selectedDate || undefined }),
      });
      if (!res.ok) throw new Error("Action failed");
      fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  };

  if (loading) return <div className="text-center py-10 text-[var(--brand-muted)]">Loading...</div>;

  return (
    <div className="max-w-lg mx-auto py-6">
      <h1 className="text-2xl font-bold text-center mb-6">Shop Management</h1>

      {error && (
        <div role="alert" className="bg-red-50 border border-[var(--brand-error)] text-[var(--brand-error)] px-4 py-2 rounded-lg mb-4 text-center text-sm">
          {error}
        </div>
      )}

      <div className="bg-[var(--brand-card)] rounded-xl shadow-sm border p-5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-[var(--brand-muted)]">Shop</span>
          <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full ${shopOpen ? "bg-green-100 text-[var(--brand-success)]" : "bg-red-100 text-[var(--brand-error)]"}`}>
            {shopOpen ? "Open" : "Closed"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-[var(--brand-muted)]">Gate</span>
          <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full ${gateOpen ? "bg-green-100 text-[var(--brand-success)]" : "bg-red-100 text-[var(--brand-error)]"}`}>
            {gateOpen ? "Accepting Orders" : "Closed"}
          </span>
        </div>
        {shopOpen && gateOpen && orderDate && (
          <div className="mt-4 pt-3 border-t text-center">
            <p className="text-sm text-[var(--brand-muted)]">Accepting orders for</p>
            <p className="font-semibold text-[var(--brand-primary)]">{formatDate(new Date(orderDate))}</p>
          </div>
        )}
        {shopOpen && !gateOpen && (
          <div className="mt-4 pt-3 border-t text-center">
            <p className="text-sm text-[var(--brand-warning)]">Gate closed — processing current orders</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {!shopOpen && !gateOpen && (
          <div className="bg-[var(--brand-card)] rounded-xl shadow-sm border p-4">
            <label htmlFor="order-date" className="block text-sm font-medium mb-2">Select Order Date</label>
            <input
              type="date"
              id="order-date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)]"
            />
          </div>
        )}

        <button
          onClick={() => handleAction("open_shop")}
          disabled={!shopOpen && !selectedDate}
          className="w-full bg-[var(--brand-success)] text-white px-6 py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:opacity-90 transition"
        >
          Open Shop
        </button>

        <button
          onClick={() => handleAction("close_shop")}
          disabled={!shopOpen}
          className="w-full bg-[var(--brand-error)] text-white px-6 py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:opacity-90 transition"
        >
          Close Shop
        </button>

        <button
          onClick={() => handleAction("close_gate")}
          disabled={!gateOpen}
          className="w-full bg-[var(--brand-warning)] text-white px-6 py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:opacity-90 transition"
        >
          Close Gate for Orders
        </button>
      </div>
    </div>
  );
}
