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
    printWindow.document.write("<style>body{font-family:Arial,sans-serif;padding:20px;} .print-box{border:1px solid #ddd;padding:15px;border-radius:8px;}</style>");
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
      <h1 className="text-2xl font-bold text-center mb-3">Packaging Bay</h1>

      {dates.length > 0 && (
        <DateFilter dates={dates} selectedDate={selectedDate} basePath="/admin/packaging" />
      )}

      {selectedDate && (
        <p className="text-center text-sm text-[var(--brand-primary)] font-medium mb-4">
          {formatDate(new Date(selectedDate))}
        </p>
      )}

      {orders.length > 0 && (
        <div className="text-center mb-4 no-print">
          <button
            onClick={() => window.print()}
            className="bg-[var(--brand-primary)] text-white px-4 py-2 rounded-lg text-sm hover:bg-[var(--brand-primary-hover)] transition"
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
              className="border rounded-xl bg-[var(--brand-card)] shadow-sm break-inside-avoid flex flex-col"
            >
              <div id={`order-${order.order_id}`} className="p-4 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-bold">#{order.order_id}</h2>
                  <span className="text-xs text-[var(--brand-muted)]">
                    {formatDate(new Date(order.order_date))}
                  </span>
                </div>
                <p className="text-sm"><strong>Name:</strong> {order.name}</p>
                <p className="text-sm"><strong>House No:</strong> {order.address}</p>
                <p className="text-sm"><strong>Area:</strong> {order.area_display}</p>
                <h3 className="font-semibold text-sm mt-3 mb-1">Items:</h3>
                <ul className="list-disc list-inside text-sm text-[var(--brand-muted)]">
                  {order.items.map((item, i) => (
                    <li key={i}>
                      {item.name} ({item.quantity} {item.unit})
                    </li>
                  ))}
                </ul>
                <p className="mt-3 font-bold">₹{order.price}</p>
              </div>
              <div className="border-t px-4 py-2.5 flex justify-end no-print">
                <button
                  onClick={() => printOrder(order.order_id)}
                  className="text-[var(--brand-primary)] text-sm font-medium hover:underline"
                >
                  Print Order
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
