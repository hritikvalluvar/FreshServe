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

  useEffect(() => {
    const url = dateParam
      ? `/api/admin/sorting?order_date=${dateParam}`
      : "/api/admin/sorting";
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setCategorySummary(data.categorySummary);
        setSelectedDate(data.selectedDate);
        setDates(data.dates);
        setLoading(false);
      });
  }, [dateParam]);

  if (loading) return <div className="text-center py-10 text-gray-500">Loading...</div>;

  const entries = Object.entries(categorySummary);

  return (
    <div className="max-w-4xl mx-auto py-4">
      <h1 className="text-2xl font-bold text-center mb-3">Sorting Bay</h1>

      {dates.length > 0 && (
        <DateFilter dates={dates} selectedDate={selectedDate} basePath="/admin/sorting" />
      )}

      {selectedDate && (
        <h2 className="text-center text-lg text-green-600 mb-4">
          {formatDate(new Date(selectedDate))}
        </h2>
      )}

      <PrintButton label="Print Sorting Bay" />

      <div className="overflow-x-auto shadow rounded-lg">
        <table className="w-full text-center text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2">
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Subcategory</th>
              <th className="p-2 border">Count</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-gray-500">No data available for the selected date.</td>
              </tr>
            ) : (
              entries.map(([category, subcategories]) => {
                const subs = Object.entries(subcategories);
                return subs.map(([sub, count], i) => (
                  <tr key={`${category}-${sub}`} className="border-b">
                    {i === 0 && (
                      <td rowSpan={subs.length} className="p-2 border font-bold align-middle">
                        {category}
                      </td>
                    )}
                    <td className="p-2 border">{sub}</td>
                    <td className="p-2 border">{count}</td>
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
