"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requestPhotographer } from "@/app/(authenticated)/lisa-kuulutus/actions";

export function PhotographerDialog({
  defaultAddress,
}: {
  defaultAddress?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input = {
      name: fd.get("name"),
      address: fd.get("address"),
      preferred_dates: [fd.get("date1"), fd.get("date2"), fd.get("date3")].filter(
        Boolean
      ),
      notes: fd.get("notes"),
    };
    startTransition(async () => {
      const res = await requestPhotographer(input);
      if (res.ok) {
        toast.success("Võtame teiega 24h jooksul ühendust");
        setOpen(false);
      } else {
        toast.error(res.error ?? "Broneerimine ebaõnnestus");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="outline" />}>
        <Camera className="size-4" /> Telli profifotograaf
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Telli profifotograaf</DialogTitle>
          <DialogDescription>
            Professionaalsed fotod aitavad kodu kiiremini müüa. Täida vorm ja
            võtame sinuga ühendust.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ph-name">Nimi</Label>
            <Input id="ph-name" name="name" required placeholder="Sinu nimi" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ph-address">Objekti aadress</Label>
            <Input
              id="ph-address"
              name="address"
              required
              defaultValue={defaultAddress}
              placeholder="Tänav 1, Tallinn"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Sobivad kuupäevad (kuni 3)</Label>
            <div className="grid gap-2">
              <Input name="date1" type="date" required />
              <Input name="date2" type="date" />
              <Input name="date3" type="date" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ph-notes">Märkused (valikuline)</Label>
            <Textarea
              id="ph-notes"
              name="notes"
              rows={2}
              placeholder="Nt parim aeg, ligipääs..."
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saadan..." : "Saada broneering"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
