export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-[var(--brand-primary)] border-t-transparent" />
    </div>
  );
}
