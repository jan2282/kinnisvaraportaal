import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getOffer } from "@/lib/queries/offers";
import { ClosingChecklist } from "./closing-checklist";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Tehing" };

export default async function TehingPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  const user = await requireUser();
  const offer = await getOffer(offerId, user.id);

  if (!offer) notFound();

  if (offer.status !== "accepted") {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 text-center sm:px-6">
        <p className="text-lg font-medium">See pakkumine ei ole (veel) vastu võetud</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Tehingu samme näeb pärast pakkumise vastuvõtmist.
        </p>
        <Link href="/pakkumised" className="mt-4 inline-block text-primary hover:underline">
          Tagasi pakkumiste juurde
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/pakkumised"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Tagasi pakkumiste juurde
      </Link>

      <div className="mb-8 flex flex-col gap-2 rounded-2xl border bg-card p-6">
        <Badge className="w-fit border-transparent bg-success/15 text-success">
          Tehing käimas
        </Badge>
        <Link
          href={`/kuulutused/${offer.listing_id}`}
          className="text-xl font-semibold hover:underline"
        >
          {offer.listing?.title ?? "Kuulutus"}
        </Link>
        <p className="text-lg font-semibold text-primary">
          Kokkulepitud hind: {formatPrice(offer.amount)}
        </p>
      </div>

      <h1 className="mb-4 text-lg font-semibold">Tehingu sammud</h1>
      <ClosingChecklist offerId={offer.id} initial={offer.closing_progress} />
    </div>
  );
}
