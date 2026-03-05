import Link from "next/link";
import Button from "@/components/ui/Button";

export default function ClosedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-3xl font-bold mb-4">We&apos;re Sorry!</h1>
      <p className="text-[var(--brand-muted)] mb-2">Currently, we are not collecting any orders.</p>
      <p className="text-[var(--brand-muted)] mb-6">
        Please check back later or{" "}
        <Link href="/contact" className="text-[var(--brand-primary)] underline">contact us</Link>{" "}
        for more information.
      </p>
      <div className="flex gap-3">
        <Button href="/">Go to Home</Button>
        <Button href="/menu" variant="secondary">Check Menu</Button>
      </div>
    </div>
  );
}
