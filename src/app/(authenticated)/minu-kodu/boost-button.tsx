"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BoostButton({ listingId }: { listingId: string }) {
  const [pending, setPending] = useState(false);

  async function boost() {
    setPending(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error ?? "Makse alustamine ebaõnnestus");
      }
    } catch {
      toast.error("Makse alustamine ebaõnnestus");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={boost} disabled={pending}>
      <Sparkles className="size-4" /> Tõsta esile
    </Button>
  );
}

// Näitab makse staatuse toasti pärast Stripe checkout'i tagasisuunamist
export function PaymentToast() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const status = params.get("payment");
    if (status === "success") {
      toast.success("Makse õnnestus! Kuulutus on esile tõstetud.");
      router.replace("/minu-kodu");
    } else if (status === "cancelled") {
      toast.info("Makse katkestati.");
      router.replace("/minu-kodu");
    }
  }, [params, router]);

  return null;
}
