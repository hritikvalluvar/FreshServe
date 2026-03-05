"use client";

export default function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <div className="text-center mb-4 no-print">
      <button
        onClick={() => window.print()}
        className="bg-[var(--brand-primary)] text-white px-4 py-2 rounded text-sm hover:bg-[var(--brand-primary-hover)]"
      >
        {label}
      </button>
    </div>
  );
}
