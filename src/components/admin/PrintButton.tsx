"use client";

export default function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <div className="text-center mb-4 no-print">
      <button
        onClick={() => window.print()}
        className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
      >
        {label}
      </button>
    </div>
  );
}
