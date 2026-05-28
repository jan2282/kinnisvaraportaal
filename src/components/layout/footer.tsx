import Link from "next/link";
import { Home } from "lucide-react";

const FOOTER_LINKS = [
  { href: "/kuidas-toimib", label: "Kuidas toimib" },
  { href: "/kkk", label: "KKK" },
  { href: "/privaatsus", label: "Privaatsuspoliitika" },
  { href: "/kontakt", label: "Kontakt" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-secondary/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-primary"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Home className="size-4" />
            </span>
            Kodu
          </Link>

          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col items-start justify-between gap-2 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <p>Kodu — kinnisvara ilma maaklerita</p>
          <p>© {new Date().getFullYear()} Kodu. Kõik õigused kaitstud.</p>
        </div>
      </div>
    </footer>
  );
}
