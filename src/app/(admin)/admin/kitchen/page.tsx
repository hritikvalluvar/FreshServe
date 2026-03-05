"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatDate } from "@/lib/utils";
import DateFilter from "@/components/admin/DateFilter";
import PrintButton from "@/components/admin/PrintButton";

interface CategoryData {
  quantity: number;
  batter: number;
  unit: string;
}

export default function KitchenViewPage() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("order_date");

  const [categoryTotals, setCategoryTotals] = useState<Record<string, CategoryData>>({});
  const [totalIdliBatter, setTotalIdliBatter] = useState<number | null>(null);
  const [totalRagiBatter, setTotalRagiBatter] = useState<number | null>(null);
  const [riceForIdli, setRiceForIdli] = useState<number | null>(null);
  const [riceForRagi, setRiceForRagi] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const url = dateParam
      ? `/api/admin/kitchen?order_date=${dateParam}`
      : "/api/admin/kitchen";
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch kitchen data");
        return res.json();
      })
      .then((data) => {
        setCategoryTotals(data.categoryTotals);
        setTotalIdliBatter(data.totalIdliBatter);
        setTotalRagiBatter(data.totalRagiBatter);
        setRiceForIdli(data.riceForIdli);
        setRiceForRagi(data.riceForRagi);
        setSelectedDate(data.selectedDate);
        setDates(data.dates);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load");
        setLoading(false);
      });
  }, [dateParam]);

  if (loading) return <div className="text-center py-10 text-[var(--brand-muted)]">Loading...</div>;

  if (error) {
    return <div className="text-center py-10 text-[var(--brand-error)]">{error}</div>;
  }

  const entries = Object.entries(categoryTotals);

  return (
    <div className="max-w-4xl mx-auto py-4">
      <h1 className="text-2xl font-bold text-center mb-3">Kitchen View</h1>

      {dates.length > 0 && (
        <DateFilter dates={dates} selectedDate={selectedDate} basePath="/admin/kitchen" />
      )}

      {selectedDate && (
        <h2 className="text-center text-lg text-[var(--brand-success)] mb-4">
          {formatDate(new Date(selectedDate))}
        </h2>
      )}

      <PrintButton label="Print View" />

      <div className="overflow-x-auto shadow rounded-lg">
        <table className="w-full text-center text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2">
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Quantity Ordered</th>
              <th className="p-2 border">Total Batter Required (Kg)</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-[var(--brand-muted)]">No data available for the selected date.</td>
              </tr>
            ) : (
              <>
                {entries.map(([category, data]) => (
                  <tr key={category} className="border-b">
                    <td className="p-2 border">{category}</td>
                    <td className="p-2 border">
                      {data.quantity > 0 ? `${data.quantity} ${data.unit}` : "-"}
                    </td>
                    <td className="p-2 border">
                      {data.batter > 0 ? data.batter : "-"}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan={2} className="p-2 border text-right font-bold">Total Idli Batter</td>
                  <td className="p-2 border font-bold">{totalIdliBatter ?? "-"} kg</td>
                </tr>
                <tr className="bg-gray-50">
                  <td colSpan={2} className="p-2 border text-right font-bold">Total Ragi Batter</td>
                  <td className="p-2 border font-bold">{totalRagiBatter ?? "-"} kg</td>
                </tr>
                <tr className="bg-gray-50">
                  <td colSpan={2} className="p-2 border text-right font-bold">Rice Needed for Idli Batter</td>
                  <td className="p-2 border font-bold">{riceForIdli ?? "-"} kg</td>
                </tr>
                <tr className="bg-gray-50">
                  <td colSpan={2} className="p-2 border text-right font-bold">Rice Needed for Ragi Batter</td>
                  <td className="p-2 border font-bold">{riceForRagi ?? "-"} kg</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
