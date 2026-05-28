"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/kuulutused?q=${encodeURIComponent(q)}` : "/kuulutused");
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="flex items-center gap-2 rounded-full border bg-background px-4 py-2 shadow-sm transition-shadow focus-within:shadow-md">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Otsi linna, aadressi või piirkonna järgi"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
    </form>
  );
}
