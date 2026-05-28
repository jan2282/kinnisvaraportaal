import type { Metadata } from "next";
import { Suspense } from "react";
import { MapIcon, SearchX } from "lucide-react";
import { ListingFilters } from "@/components/listings/filters";
import { ListingCard } from "@/components/listings/listing-card";
import { getActiveListings, type ListingFilters as Filters } from "@/lib/queries/listings";
import type { ListingType } from "@/lib/supabase/database.types";

export const metadata: Metadata = {
  title: "Kuulutused",
  description: "Sirvi müügilolevat kinnisvara üle Eesti.",
};

function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const num = (k: string) => {
    const v = get(k);
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) ? n : undefined;
  };
  const sort = get("sort");
  return {
    q: get("q") || undefined,
    city: get("city") || undefined,
    type: (get("type") as ListingType) || undefined,
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    rooms: num("rooms"),
    minSize: num("minSize"),
    sort:
      sort === "price_asc" || sort === "price_desc" || sort === "size_desc"
        ? sort
        : "newest",
  };
}

export default async function KuulutusedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const listings = await getActiveListings(filters);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Kuulutused</h1>
        <button
          type="button"
          disabled
          className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm text-muted-foreground opacity-60"
          title="Kaardivaade tuleb peagi"
        >
          <MapIcon className="size-4" /> Kaardivaade
        </button>
      </div>

      <Suspense>
        <ListingFilters total={listings.length} />
      </Suspense>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <SearchX className="size-10 text-muted-foreground" />
          <p className="text-lg font-medium">Ühtegi kuulutust ei leitud</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Proovi filtreid muuta või tühjendada, et näha rohkem tulemusi.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
