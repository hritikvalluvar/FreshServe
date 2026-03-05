export default function SuccessLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-center">
      <div className="bg-[var(--brand-card)] shadow-lg rounded-xl p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-4 border-[var(--brand-primary)] border-t-transparent" />
          <p className="text-lg text-[var(--brand-muted)]">Verifying payment...</p>
        </div>
      </div>
    </div>
  );
}
