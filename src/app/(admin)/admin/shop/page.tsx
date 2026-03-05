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
    <div className="max-w-xl mx-auto py-6">
      <h1 className="text-2xl font-bold text-center mb-6">Shop Management</h1>

      {error && (
        <div role="alert" className="bg-red-50 border border-[var(--brand-error)] text-[var(--brand-error)] px-4 py-2 rounded mb-4 text-center">
          {error}
        </div>
      )}

      <div className="text-center mb-4 space-y-1">
        <p>
          Shop Status:{" "}
          <strong className={shopOpen ? "text-[var(--brand-success)]" : "text-[var(--brand-error)]"}>
            {shopOpen ? "Open" : "Closed"}
          </strong>
        </p>
        <p>
          Gate Status:{" "}
          <strong className={gateOpen ? "text-[var(--brand-success)]" : "text-[var(--brand-error)]"}>
            {gateOpen ? "Open for Orders" : "Closed for Orders"}
          </strong>
        </p>
      </div>

      <div className="text-center mb-6">
        {shopOpen && gateOpen && orderDate && (
          <h2 className="text-lg text-[var(--brand-success)]">
            The shop is open and accepting orders for {formatDate(new Date(orderDate))}.
          </h2>
        )}
        {shopOpen && !gateOpen && (
          <h2 className="text-lg text-[var(--brand-warning)]">
            Not accepting new orders, but shop open for current orders.
          </h2>
        )}
        {!shopOpen && (
          <h2 className="text-lg text-[var(--brand-error)]">
            The shop is closed and not accepting any orders.
          </h2>
        )}
      </div>

      <div className="flex flex-col items-center gap-4">
        {!shopOpen && !gateOpen && (
          <div>
            <label htmlFor="order-date" className="block text-sm mb-1">Select Order Date:</label>
            <input
              type="date"
              id="order-date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
        )}

        <button
          onClick={() => handleAction("open_shop")}
          disabled={!shopOpen && !selectedDate}
          className="bg-[var(--brand-success)] text-white px-6 py-3 rounded-lg w-52 disabled:bg-gray-300 disabled:cursor-not-allowed hover:opacity-90"
        >
          Open Shop
        </button>

        <button
          onClick={() => handleAction("close_shop")}
          disabled={!shopOpen}
          className="bg-[var(--brand-error)] text-white px-6 py-3 rounded-lg w-52 disabled:bg-gray-300 disabled:cursor-not-allowed hover:opacity-90"
        >
          Close Shop
        </button>

        <button
          onClick={() => handleAction("close_gate")}
          disabled={!gateOpen}
          className="bg-[var(--brand-warning)] text-white px-6 py-3 rounded-lg w-52 disabled:bg-gray-300 disabled:cursor-not-allowed hover:opacity-90"
        >
          Close Gate for Orders
        </button>
      </div>
    </div>
  );
}
