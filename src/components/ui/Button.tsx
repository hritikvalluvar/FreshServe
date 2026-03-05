import Link from "next/link";

const variants = {
  primary:
    "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed",
  secondary:
    "border border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed",
  danger:
    "bg-[var(--brand-error)] text-white hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed",
  ghost:
    "text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 disabled:opacity-50 disabled:cursor-not-allowed",
} as const;

type Variant = keyof typeof variants;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  href?: string;
}

export default function Button({
  variant = "primary",
  href,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base = `inline-flex items-center justify-center px-6 py-2 rounded-lg font-medium transition-colors ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    );
  }

  return (
    <button className={base} {...props}>
      {children}
    </button>
  );
}
