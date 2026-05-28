import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Eye, MessageSquare, HandCoins, ImageOff, Home } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getSellerListings, coverImage } from "@/lib/queries/listings";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/listings/status-badge";
import { ListingRowActions } from "./listing-row-actions";
import { BoostButton, PaymentToast } from "./boost-button";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Minu kuulutused" };

export default async function MinuKoduPage() {
  const user = await requireUser();
  const listings = await getSellerListings(user.id);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense>
        <PaymentToast />
      </Suspense>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Minu kuulutused</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Halda oma müügilolevat kinnisvara
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/lisa-kuulutus" />}>
          <Plus className="size-4" /> Lisa kuulutus
        </Button>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed py-20 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <Home className="size-7" />
          </span>
          <div>
            <p className="text-lg font-medium">Sul pole veel ühtegi kuulutust</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Loo oma esimene kuulutus ja jõua otse ostjateni.
            </p>
          </div>
          <Button nativeButton={false} render={<Link href="/lisa-kuulutus" />}>
            <Plus className="size-4" /> Lisa esimene kuulutus
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {listings.map((listing) => {
            const cover = coverImage(listing);
            const inquiries = listing.inquiries?.[0]?.count ?? 0;
            const offers = listing.offers?.[0]?.count ?? 0;
            return (
              <div
                key={listing.id}
                className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center"
              >
                <Link
                  href={`/kuulutused/${listing.id}`}
                  className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:size-28"
                >
                  {cover ? (
                    <Image
                      src={cover}
                      alt={listing.title}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <ImageOff className="size-6" />
                    </div>
                  )}
                </Link>

                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/kuulutused/${listing.id}`}
                      className="font-semibold hover:underline"
                    >
                      {listing.title}
                    </Link>
                    <StatusBadge status={listing.status} />
                  </div>
                  <p className="text-lg font-semibold text-primary">
                    {formatPrice(listing.price)}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Eye className="size-4" /> {listing.views} vaatamist
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="size-4" /> {inquiries} küsimust
                    </span>
                    <span className="flex items-center gap-1.5">
                      <HandCoins className="size-4" /> {offers} pakkumist
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <BoostButton listingId={listing.id} />
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false} render={<Link href={`/lisa-kuulutus?edit=${listing.id}`} />}
                  >
                    Muuda
                  </Button>
                  <ListingRowActions listingId={listing.id} status={listing.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
