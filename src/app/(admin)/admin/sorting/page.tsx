"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatDate } from "@/lib/utils";
import DateFilter from "@/components/admin/DateFilter";
import PrintButton from "@/components/admin/PrintButton";

export default function SortingBayPage() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("order_date");

  const [categorySummary, setCategorySummary] = useState<Record<string, Record<string, number>>>({});
  const [selectedDate, setSelectedDate] = useState("");
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const url = dateParam
      ? `/api/admin/sorting?order_date=${dateParam}`
      : "/api/admin/sorting";
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch sorting data");
        return res.json();
      })
      .then((data) => {
        setCategorySummary(data.categorySummary);
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

  const entries = Object.entries(categorySummary);

  return (
    <div className="max-w-4xl mx-auto py-4">
      <h1 className="text-2xl font-bold text-center mb-3">Sorting Bay</h1>

      {dates.length > 0 && (
        <DateFilter dates={dates} selectedDate={selectedDate} basePath="/admin/sorting" />
      )}

      {selectedDate && (
        <p className="text-center text-sm text-[var(--brand-primary)] font-medium mb-4">
          {formatDate(new Date(selectedDate))}
        </p>
      )}

      <PrintButton label="Print Sorting Bay" />

      <div className="bg-[var(--brand-card)] overflow-x-auto shadow-sm rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-[var(--brand-muted)]">
              <th className="p-3 text-left font-medium">Category</th>
              <th className="p-3 text-left font-medium">Subcategory</th>
              <th className="p-3 text-right font-medium">Count</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-[var(--brand-muted)]">No data available for the selected date.</td>
              </tr>
            ) : (
              entries.map(([category, subcategories]) => {
                const subs = Object.entries(subcategories);
                return subs.map(([sub, count], i) => (
                  <tr key={`${category}-${sub}`} className="border-b">
                    {i === 0 && (
                      <td rowSpan={subs.length} className="p-3 font-semibold align-middle">
                        {category}
                      </td>
                    )}
                    <td className="p-3">{sub}</td>
                    <td className="p-3 text-right">{count}</td>
                  </tr>
                ));
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
