"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatDate } from "@/lib/utils";
import DateFilter from "@/components/admin/DateFilter";

interface PackagingOrder {
  order_id: string;
  name: string;
  address: string;
  area: string;
  area_display: string;
  order_date: string;
  price: number;
  items: { name: string; quantity: number; unit: string }[];
}

export default function PackagingBayPage() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("order_date");

  const [orders, setOrders] = useState<PackagingOrder[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const url = dateParam
      ? `/api/admin/packaging?order_date=${dateParam}`
      : "/api/admin/packaging";
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch packaging data");
        return res.json();
      })
      .then((data) => {
        setOrders(data.orders);
        setSelectedDate(data.selectedDate);
        setDates(data.dates);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load");
        setLoading(false);
      });
  }, [dateParam]);

  const printOrder = (orderId: string) => {
    const el = document.getElementById(`order-${orderId}`);
    if (!el) return;
    const printWindow = window.open("", "", "height=600,width=800");
    if (!printWindow) return;
    printWindow.document.write(`<html><head><title>Order #${orderId}</title>`);
    printWindow.document.write("<style>body{font-family:Arial,sans-serif;padding:20px;} .print-box{border:1px solid #ddd;padding:15px;}</style>");
    printWindow.document.write("</head><body>");
    printWindow.document.write(`<div class="print-box">${el.innerHTML}</div>`);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) return <div className="text-center py-10 text-[var(--brand-muted)]">Loading...</div>;

  if (error) {
    return <div className="text-center py-10 text-[var(--brand-error)]">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-4">
      <h1 className="text-2xl font-bold text-center mb-3">Packaging Bay View</h1>

      {dates.length > 0 && (
        <DateFilter dates={dates} selectedDate={selectedDate} basePath="/admin/packaging" />
      )}

      {selectedDate && (
        <h2 className="text-center text-lg text-[var(--brand-success)] mb-4">
          {formatDate(new Date(selectedDate))}
        </h2>
      )}

      {orders.length > 0 && (
        <div className="text-center mb-4 no-print">
          <button
            onClick={() => window.print()}
            className="bg-[var(--brand-success)] text-white px-4 py-2 rounded text-sm hover:opacity-90"
          >
            Print All Orders
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.length === 0 ? (
          <p className="col-span-full text-center text-[var(--brand-muted)]">No orders available for the selected date.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order.order_id}
              id={`order-${order.order_id}`}
              className="border rounded-lg p-4 bg-[var(--brand-card)] shadow-sm break-inside-avoid"
            >
              <h2 className="text-lg font-bold mb-1">Order #{order.order_id}</h2>
              <h3 className="text-sm text-[var(--brand-muted)] mb-2">
                {formatDate(new Date(order.order_date))}
              </h3>
              <p><strong>Name:</strong> {order.name}</p>
              <p><strong>House No:</strong> {order.address}</p>
              <p><strong>Area:</strong> {order.area_display}</p>
              <h3 className="font-semibold mt-2 mb-1">Order Items:</h3>
              <ul className="list-disc list-inside text-sm">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.name} ({item.quantity} {item.unit})
                  </li>
                ))}
              </ul>
              <p className="mt-2 font-bold">Total Price: ₹{order.price}</p>
              <button
                onClick={() => printOrder(order.order_id)}
                className="mt-2 bg-[var(--brand-success)] text-white px-3 py-1 rounded text-sm hover:opacity-90 no-print"
              >
                Print This Order
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
