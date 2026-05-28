"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { CalendarDays, HandCoins, MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createInquiry,
  createOffer,
  createViewing,
  type ActionResult,
} from "@/app/(site)/kuulutused/[id]/actions";
import { formatPrice } from "@/lib/format";

type DialogKind = "inquiry" | "offer" | "viewing" | null;

export function ListingActions({
  listingId,
  sellerId,
  isLoggedIn,
  isOwner,
  price,
}: {
  listingId: string;
  sellerId: string;
  isLoggedIn: boolean;
  isOwner: boolean;
  price: number | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState<DialogKind>(null);
  const [pending, startTransition] = useTransition();

  if (isOwner) {
    return (
      <div className="rounded-xl border bg-secondary/40 p-4 text-center text-sm text-muted-foreground">
        See on sinu kuulutus.{" "}
        <Link href="/minu-kodu" className="font-medium text-primary hover:underline">
          Halda kuulutust
        </Link>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col gap-2">
        <Button size="lg" render={<Link href="/sisene" />}>
          Logi sisse, et ühendust võtta
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Küsimuste, pakkumiste ja vaatamiste jaoks logi sisse.
        </p>
      </div>
    );
  }

  function handle(
    action: (input: unknown) => Promise<ActionResult>,
    input: unknown,
    successMsg: string
  ) {
    startTransition(async () => {
      const res = await action(input);
      if (res.ok) {
        toast.success(successMsg);
        setOpen(null);
        if (res.redirect) router.push(res.redirect);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <Button size="lg" onClick={() => setOpen("viewing")}>
          <CalendarDays className="size-4" /> Broneeri vaatamine
        </Button>
        <Button size="lg" variant="outline" onClick={() => setOpen("offer")}>
          <HandCoins className="size-4" /> Tee pakkumine
        </Button>
        <Button size="lg" variant="ghost" onClick={() => setOpen("inquiry")}>
          <MessageCircleQuestion className="size-4" /> Esita küsimus
        </Button>
      </div>

      {/* KÜSIMUS */}
      <Dialog open={open === "inquiry"} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Esita küsimus müüjale</DialogTitle>
            <DialogDescription>
              Sinu sõnum jõuab müüjani ja vestlus avaneb sõnumites.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              handle(
                createInquiry,
                { listingId, sellerId, message: fd.get("message") },
                "Küsimus saadetud"
              );
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="inq-msg">Sõnum</Label>
              <Textarea
                id="inq-msg"
                name="message"
                rows={4}
                required
                placeholder="Tere! Mind huvitab teie kuulutus. Kas..."
              />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? "Saadan..." : "Saada küsimus"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* PAKKUMINE */}
      <Dialog open={open === "offer"} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tee pakkumine</DialogTitle>
            <DialogDescription>
              {price != null
                ? `Küsitav hind: ${formatPrice(price)}`
                : "Esita oma pakkumine müüjale."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              handle(
                createOffer,
                {
                  listingId,
                  sellerId,
                  amount: fd.get("amount"),
                  message: fd.get("message"),
                },
                "Pakkumine saadetud"
              );
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="off-amount">Pakkumise summa (€)</Label>
              <Input
                id="off-amount"
                name="amount"
                type="number"
                inputMode="numeric"
                min={1}
                required
                placeholder={price ? String(price) : "150000"}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="off-msg">Sõnum (valikuline)</Label>
              <Textarea
                id="off-msg"
                name="message"
                rows={3}
                placeholder="Lisainfo pakkumise kohta..."
              />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? "Saadan..." : "Saada pakkumine"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* VAATAMINE */}
      <Dialog open={open === "viewing"} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Broneeri vaatamine</DialogTitle>
            <DialogDescription>
              Paku sobiv aeg – müüja kinnitab vaatamise.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              handle(
                createViewing,
                {
                  listingId,
                  sellerId,
                  date: fd.get("date"),
                  time: fd.get("time"),
                },
                "Vaatamise soov saadetud"
              );
            }}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="vw-date">Kuupäev</Label>
                <Input id="vw-date" name="date" type="date" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="vw-time">Kellaaeg</Label>
                <Input id="vw-time" name="time" type="time" required />
              </div>
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? "Saadan..." : "Saada vaatamise soov"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
