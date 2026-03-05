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
    <div className="flex justify-center mb-4 no-print">
      <label htmlFor="order_date" className="mr-2 text-sm self-center">
        Select Order Date:
      </label>
      <select
        id="order_date"
        value={selectedDate}
        onChange={handleChange}
        className="border rounded px-2 py-1 text-sm"
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
