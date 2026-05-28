import Link from "next/link";
import Image from "next/image";
import { BedDouble, Maximize, MapPin, ImageOff } from "lucide-react";
import { coverImage, type ListingCardData } from "@/lib/queries/listings";
import { formatPrice, formatDaysListed } from "@/lib/format";
import { LISTING_TYPE_LABELS } from "@/lib/constants";

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const cover = coverImage(listing);
  const location = [listing.address, listing.parish ?? listing.city]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={`/kuulutused/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-[var(--shadow-card)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {cover ? (
          <Image
            src={cover}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-8" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
          {LISTING_TYPE_LABELS[listing.type]}
        </span>
        <span className="absolute bottom-3 left-3 rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm">
          {formatPrice(listing.price)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 font-semibold text-foreground">
          {listing.title}
        </h3>

        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="line-clamp-1">{location || "—"}</span>
        </p>

        <div className="mt-auto flex items-center gap-4 pt-2 text-sm text-muted-foreground">
          {listing.rooms != null && (
            <span className="flex items-center gap-1.5">
              <BedDouble className="size-4" />
              {listing.rooms} tuba
            </span>
          )}
          {listing.size_m2 != null && (
            <span className="flex items-center gap-1.5">
              <Maximize className="size-4" />
              {listing.size_m2} m²
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {formatDaysListed(listing.created_at)}
        </p>
      </div>
    </Link>
  );
}
