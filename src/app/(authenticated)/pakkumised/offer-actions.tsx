"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptOffer, rejectOffer, withdrawOffer } from "./actions";
import type { OfferStatus } from "@/lib/supabase/database.types";

export function SellerOfferActions({
  offerId,
  status,
}: {
  offerId: string;
  status: OfferStatus;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, msg: string) {
    start(async () => {
      const res = await fn();
      if (res.ok) {
        toast.success(msg);
        router.refresh();
      } else toast.error(res.error ?? "Tegevus ebaõnnestus");
    });
  }

  if (status === "accepted") {
    return (
      <Button size="sm" render={<Link href={`/tehing/${offerId}`} />}>
        Vaata tehingut <ArrowRight className="size-4" />
      </Button>
    );
  }
  if (status !== "pending") return null;

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={() => run(() => acceptOffer(offerId), "Pakkumine vastu võetud")}
        disabled={pending}
      >
        <Check className="size-4" /> Võta vastu
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => run(() => rejectOffer(offerId), "Pakkumine tagasi lükatud")}
        disabled={pending}
      >
        <X className="size-4" /> Lükka tagasi
      </Button>
    </div>
  );
}

export function BuyerOfferActions({
  offerId,
  status,
}: {
  offerId: string;
  status: OfferStatus;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  if (status === "accepted") {
    return (
      <Button size="sm" render={<Link href={`/tehing/${offerId}`} />}>
        Vaata tehingut <ArrowRight className="size-4" />
      </Button>
    );
  }
  if (status !== "pending") return null;

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await withdrawOffer(offerId);
          if (res.ok) {
            toast.success("Pakkumine tagasi võetud");
            router.refresh();
          } else toast.error(res.error ?? "Tegevus ebaõnnestus");
        })
      }
    >
      Võta tagasi
    </Button>
  );
}
