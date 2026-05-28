"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { LISTING_TYPE_OPTIONS, CITY_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const selectClass =
  "h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const SORT_OPTIONS = [
  { value: "newest", label: "Uusimad" },
  { value: "price_asc", label: "Hind: odavamad ees" },
  { value: "price_desc", label: "Hind: kallimad ees" },
  { value: "size_desc", label: "Suurus: suuremad ees" },
];

const ROOM_OPTIONS = [
  { value: "1", label: "1+ tuba" },
  { value: "2", label: "2+ tuba" },
  { value: "3", label: "3+ tuba" },
  { value: "4", label: "4+ tuba" },
];

export function ListingFilters({
  total,
}: {
  total: number;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.push(`/kuulutused?${next.toString()}`);
    },
    [params, router]
  );

  const hasFilters = ["q", "city", "type", "minPrice", "maxPrice", "rooms"].some(
    (k) => params.has(k)
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <SlidersHorizontal className="size-4" /> Filtreeri
        </span>

        <select
          className={selectClass}
          value={params.get("city") ?? ""}
          onChange={(e) => setParam("city", e.target.value)}
          aria-label="Linn"
        >
          <option value="">Kõik linnad</option>
          {CITY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={params.get("type") ?? ""}
          onChange={(e) => setParam("type", e.target.value)}
          aria-label="Tüüp"
        >
          <option value="">Kõik tüübid</option>
          {LISTING_TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={params.get("rooms") ?? ""}
          onChange={(e) => setParam("rooms", e.target.value)}
          aria-label="Toad"
        >
          <option value="">Toad</option>
          {ROOM_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        <input
          type="number"
          inputMode="numeric"
          placeholder="Hind alates"
          defaultValue={params.get("minPrice") ?? ""}
          onBlur={(e) => setParam("minPrice", e.target.value)}
          className={cn(selectClass, "w-32")}
          aria-label="Miinimumhind"
        />
        <input
          type="number"
          inputMode="numeric"
          placeholder="Hind kuni"
          defaultValue={params.get("maxPrice") ?? ""}
          onBlur={(e) => setParam("maxPrice", e.target.value)}
          className={cn(selectClass, "w-32")}
          aria-label="Maksimumhind"
        />

        {hasFilters && (
          <button
            onClick={() => router.push("/kuulutused")}
            className="flex h-10 items-center gap-1 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" /> Tühjenda
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? "kuulutus" : "kuulutust"}
        </p>
        <select
          className={selectClass}
          value={params.get("sort") ?? "newest"}
          onChange={(e) => setParam("sort", e.target.value)}
          aria-label="Sorteeri"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
