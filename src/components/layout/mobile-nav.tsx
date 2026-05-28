"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Avaleht", icon: Home },
  { href: "/kuulutused", label: "Otsing", icon: Search },
  { href: "/lisa-kuulutus", label: "Lisa", icon: Plus, highlight: true },
  { href: "/sõnumid", label: "Sõnumid", icon: MessageSquare },
  { href: "/profiil", label: "Profiil", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-40 border-t bg-background/95 backdrop-blur-md md:hidden">
      <div className="flex items-stretch justify-around">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-1 flex-col items-center justify-center gap-1 py-2"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <item.icon className="size-5" />
                </span>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("size-5", active && "fill-primary/10")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
