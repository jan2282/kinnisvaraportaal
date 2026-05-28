import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  BedDouble,
  Maximize,
  Building2,
  Zap,
  CalendarClock,
  AlertTriangle,
  Users,
  KeyRound,
  ChevronLeft,
} from "lucide-react";
import { getListingById, getSimilarListings } from "@/lib/queries/listings";
import { getUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Gallery } from "@/components/listings/gallery";
import { ListingActions } from "@/components/listings/listing-actions";
import { ListingCard } from "@/components/listings/listing-card";
import { FeatureIcon } from "@/components/listings/feature-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  LISTING_TYPE_LABELS,
  LISTING_CONDITION_LABELS,
  FEATURE_LABELS,
} from "@/lib/constants";
import { formatPrice, formatPricePerM2, formatDate } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return { title: "Kuulutus" };
  return {
    title: listing.title,
    description: listing.description?.slice(0, 160) ?? undefined,
  };
}

function initials(name: string | null, email: string) {
  if (name)
    return name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [listing, user] = await Promise.all([getListingById(id), getUser()]);

  if (!listing) notFound();

  const isOwner = user?.id === listing.seller_id;
  // Mitteomanikud näevad ainult aktiivseid kuulutusi
  if (listing.status !== "active" && !isOwner) notFound();

  const similar = await getSimilarListings(listing, 4);
  const pricePerM2 = formatPricePerM2(listing.price, listing.size_m2);

  // Loenda vaatamisi (mitte omaniku omad)
  if (!isOwner && listing.status === "active") {
    try {
      const admin = createAdminClient();
      await admin
        .from("listings")
        .update({ views: listing.views + 1 })
        .eq("id", listing.id);
    } catch {
      // best-effort
    }
  }

  const stats = [
    listing.rooms != null && { icon: BedDouble, label: "Tube", value: String(listing.rooms) },
    listing.size_m2 != null && { icon: Maximize, label: "Pindala", value: `${listing.size_m2} m²` },
    listing.floor != null && {
      icon: Building2,
      label: "Korrus",
      value: listing.floors_total
        ? `${listing.floor}/${listing.floors_total}`
        : String(listing.floor),
    },
    listing.energy_class && { icon: Zap, label: "Energiaklass", value: listing.energy_class },
    listing.year_built != null && {
      icon: CalendarClock,
      label: "Ehitusaasta",
      value: String(listing.year_built),
    },
  ].filter(Boolean) as { icon: typeof BedDouble; label: string; value: string }[];

  const legal = [
    listing.has_debt && { icon: AlertTriangle, label: "Kinnistul on hüpoteek" },
    listing.has_co_owners && { icon: Users, label: "Kinnistul on kaasomanikke" },
    listing.has_tenants && { icon: KeyRound, label: "Kinnistul on üürnikke" },
  ].filter(Boolean) as { icon: typeof Users; label: string }[];

  const location = [listing.address, listing.parish, listing.city, listing.county]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/kuulutused"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Tagasi kuulutuste juurde
      </Link>

      <Gallery images={listing.listing_images} title={listing.title} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* PEAMINE SISU */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{LISTING_TYPE_LABELS[listing.type]}</Badge>
              {listing.condition && (
                <Badge variant="outline">
                  {LISTING_CONDITION_LABELS[listing.condition]}
                </Badge>
              )}
              {listing.status !== "active" && (
                <Badge variant="outline" className="border-gold text-gold-foreground">
                  Pole avaldatud
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">{listing.title}</h1>
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="size-4 shrink-0" /> {location || "Asukoht täpsustamata"}
            </p>
          </div>

          {/* STATISTIKA */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center gap-1 rounded-xl border bg-card p-4 text-center"
              >
                <s.icon className="size-5 text-primary" />
                <span className="text-lg font-semibold">{s.value}</span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>

          {/* KIRJELDUS */}
          {listing.description && (
            <section className="flex flex-col gap-3">
              <h2 className="text-xl font-semibold">Kirjeldus</h2>
              <p className="whitespace-pre-line leading-relaxed text-foreground/90">
                {listing.description}
              </p>
            </section>
          )}

          {/* LISAVÄÄRTUSED */}
          {listing.listing_features.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-xl font-semibold">Mugavused</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {listing.listing_features.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-2.5 rounded-lg border bg-card px-3 py-2.5 text-sm"
                  >
                    <FeatureIcon feature={f.feature} />
                    {FEATURE_LABELS[f.feature] ?? f.feature}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* OLULINE INFO */}
          {legal.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-xl font-semibold">Oluline info</h2>
              <div className="flex flex-col gap-2">
                {legal.map((l) => (
                  <div
                    key={l.label}
                    className="flex items-center gap-2.5 rounded-lg bg-gold/10 px-3 py-2.5 text-sm text-gold-foreground"
                  >
                    <l.icon className="size-4 shrink-0" /> {l.label}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* KAART (placeholder) */}
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold">Asukoht</h2>
            <div className="flex aspect-[16/9] items-center justify-center rounded-2xl border bg-secondary/40 text-muted-foreground">
              <span className="flex items-center gap-2 text-sm">
                <MapPin className="size-4" /> Kaardivaade tuleb peagi
              </span>
            </div>
          </section>
        </div>

        {/* KÜLGRIBA */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="flex flex-col gap-5 rounded-2xl border bg-card p-6 shadow-sm">
            <div>
              <p className="text-3xl font-semibold text-primary">
                {formatPrice(listing.price)}
              </p>
              {pricePerM2 && (
                <p className="text-sm text-muted-foreground">{pricePerM2}</p>
              )}
            </div>

            <ListingActions
              listingId={listing.id}
              sellerId={listing.seller_id}
              isLoggedIn={!!user}
              isOwner={isOwner}
              price={listing.price}
            />

            {listing.seller && (
              <div className="flex items-center gap-3 border-t pt-5">
                <Avatar className="size-11 border">
                  {listing.seller.avatar_url && (
                    <AvatarImage src={listing.seller.avatar_url} alt="" />
                  )}
                  <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                    {initials(listing.seller.full_name, listing.seller.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {listing.seller.full_name || "Müüja"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Liige alates {formatDate(listing.seller.created_at)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* SARNASED */}
      {similar.length > 0 && (
        <section className="mt-16 flex flex-col gap-6">
          <h2 className="text-2xl font-semibold tracking-tight">Sarnased kuulutused</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((s) => (
              <ListingCard key={s.id} listing={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
