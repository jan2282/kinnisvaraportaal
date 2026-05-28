import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { HandCoins, ImageOff } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getReceivedOffers, getMadeOffers, type OfferWithRelations } from "@/lib/queries/offers";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SellerOfferActions, BuyerOfferActions } from "./offer-actions";
import { formatPrice, formatRelative } from "@/lib/format";
import { OFFER_STATUS_LABELS } from "@/lib/constants";
import type { OfferStatus } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Pakkumised" };

const STATUS_STYLE: Record<OfferStatus, string> = {
  pending: "bg-gold/20 text-gold-foreground",
  accepted: "bg-success/15 text-success",
  rejected: "bg-destructive/10 text-destructive",
  withdrawn: "bg-muted text-muted-foreground",
};

function offerCover(offer: OfferWithRelations): string | null {
  const imgs = offer.listing?.listing_images ?? [];
  if (imgs.length === 0) return null;
  return (imgs.find((i) => i.is_cover) ?? imgs[0]).url;
}

function OfferCard({
  offer,
  role,
}: {
  offer: OfferWithRelations;
  role: "seller" | "buyer";
}) {
  const cover = offerCover(offer);
  const party = role === "seller" ? offer.buyer : offer.seller;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row">
      <Link
        href={`/kuulutused/${offer.listing_id}`}
        className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:size-24"
      >
        {cover ? (
          <Image src={cover} alt="" fill sizes="120px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-5" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/kuulutused/${offer.listing_id}`}
            className="font-medium hover:underline"
          >
            {offer.listing?.title ?? "Kuulutus"}
          </Link>
          <Badge className={cn("border-transparent", STATUS_STYLE[offer.status])}>
            {OFFER_STATUS_LABELS[offer.status]}
          </Badge>
        </div>
        <p className="text-xl font-semibold text-primary">
          {formatPrice(offer.amount)}
        </p>
        <p className="text-sm text-muted-foreground">
          {role === "seller" ? "Ostja" : "Müüja"}:{" "}
          {party?.full_name || "Kasutaja"} · {formatRelative(offer.created_at)}
        </p>
        {offer.message && (
          <p className="mt-1 rounded-lg bg-secondary/50 px-3 py-2 text-sm">
            {offer.message}
          </p>
        )}
        <div className="mt-2">
          {role === "seller" ? (
            <SellerOfferActions offerId={offer.id} status={offer.status} />
          ) : (
            <BuyerOfferActions offerId={offer.id} status={offer.status} />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">
      <HandCoins className="size-8" />
      {text}
    </div>
  );
}

export default async function PakkumisedPage() {
  const user = await requireUser();
  const [received, made] = await Promise.all([
    getReceivedOffers(user.id),
    getMadeOffers(user.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Pakkumised</h1>

      <Tabs defaultValue="received">
        <TabsList className="mb-6">
          <TabsTrigger value="received">
            Saadud {received.length > 0 && `(${received.length})`}
          </TabsTrigger>
          <TabsTrigger value="made">
            Tehtud {made.length > 0 && `(${made.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received">
          {received.length === 0 ? (
            <EmptyState text="Sa pole veel pakkumisi saanud." />
          ) : (
            <div className="flex flex-col gap-4">
              {received.map((offer) => (
                <OfferCard key={offer.id} offer={offer} role="seller" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="made">
          {made.length === 0 ? (
            <EmptyState text="Sa pole veel pakkumisi teinud." />
          ) : (
            <div className="flex flex-col gap-4">
              {made.map((offer) => (
                <OfferCard key={offer.id} offer={offer} role="buyer" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
