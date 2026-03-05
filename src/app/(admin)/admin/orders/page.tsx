"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatDate } from "@/lib/utils";
import DateFilter from "@/components/admin/DateFilter";
import PrintButton from "@/components/admin/PrintButton";

interface OrderData {
  order_id: string;
  name: string;
  address: string;
  area: string;
  area_display: string;
  price: number;
  items_summary: string;
}

export default function OrderListPage() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("order_date");
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const url = dateParam
      ? `/api/admin/orders?order_date=${dateParam}`
      : "/api/admin/orders";
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then((data) => {
        setOrders(data.orders);
        setTotal(data.total);
        setSelectedDate(data.selectedDate);
        setDates(data.dates);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load");
        setLoading(false);
      });
  }, [dateParam]);

  const copyConfirmation = (orderId: string, name: string) => {
    const message = `${orderId} - ${name}: Order confirmed \u2705`;
    navigator.clipboard.writeText(message).then(() => {
      setCopiedId(orderId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  if (loading) return <div className="text-center py-10 text-[var(--brand-muted)]">Loading...</div>;

  if (error) {
    return <div className="text-center py-10 text-[var(--brand-error)]">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-4">
      <h1 className="text-2xl font-bold text-center mb-3">Order List</h1>

      {dates.length > 0 && (
        <DateFilter dates={dates} selectedDate={selectedDate} basePath="/admin/orders" />
      )}

      {selectedDate && (
        <p className="text-center text-sm text-[var(--brand-primary)] font-medium mb-4">
          {formatDate(new Date(selectedDate))}
        </p>
      )}

      <PrintButton label="Print Orders" />

      <div className="bg-[var(--brand-card)] overflow-x-auto shadow-sm rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-[var(--brand-muted)]">
              <th className="p-3 text-left font-medium">Order ID</th>
              <th className="p-3 text-left font-medium">Name</th>
              <th className="p-3 text-left font-medium">Address</th>
              <th className="p-3 text-left font-medium">Area</th>
              <th className="p-3 text-left font-medium">Order Items</th>
              <th className="p-3 text-right font-medium">Price</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-[var(--brand-muted)]">No orders available.</td>
              </tr>
            ) : (
              <>
                {orders.map((order) => (
                  <tr key={order.order_id} className="border-b hover:bg-gray-50/50 transition">
                    <td className="p-3 relative">
                      <button
                        onClick={() => copyConfirmation(order.order_id, order.name)}
                        className="text-[var(--brand-primary)] font-medium hover:underline cursor-pointer"
                      >
                        {order.order_id}
                      </button>
                      {copiedId === order.order_id && (
                        <span className="absolute -top-1 left-1/2 -translate-x-1/2 bg-[var(--brand-success)] text-white text-xs px-2 py-0.5 rounded">
                          Copied!
                        </span>
                      )}
                    </td>
                    <td className="p-3">{order.name}</td>
                    <td className="p-3">{order.address}</td>
                    <td className="p-3">{order.area_display}</td>
                    <td className="p-3 text-[var(--brand-muted)]">{order.items_summary}</td>
                    <td className="p-3 text-right font-semibold">₹{order.price}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={5} className="p-3 text-right">Total:</td>
                  <td className="p-3 text-right">₹{total}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
