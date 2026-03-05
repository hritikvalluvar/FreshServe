"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { formatDate } from "@/lib/utils";

export default function DateFilter({
  dates,
  selectedDate,
  basePath,
}: {
  dates: string[];
  selectedDate: string;
  basePath: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("order_date", e.target.value);
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <div className="flex justify-center items-center gap-2 mb-4 no-print">
      <label htmlFor="order_date" className="text-sm font-medium text-[var(--brand-muted)]">
        Order Date:
      </label>
      <select
        id="order_date"
        value={selectedDate}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)]"
      >
        {dates.map((date) => (
          <option key={date} value={date}>
            {formatDate(new Date(date))}
          </option>
        ))}
      </select>
    </div>
  );
}
