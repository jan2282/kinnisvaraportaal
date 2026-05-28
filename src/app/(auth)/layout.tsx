import Link from "next/link";
import { Home } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-secondary/40 px-6 py-12">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-2xl font-semibold text-primary"
      >
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Home className="size-5" />
        </span>
        Kodu
      </Link>
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-[var(--shadow-card)]">
        {children}
      </div>
      <p className="mt-6 max-w-sm text-center text-sm text-muted-foreground">
        Liitudes nõustud teenuse kasutustingimuste ja privaatsuspoliitikaga.
      </p>
    </div>
  );
}
