import type { Metadata } from "next";
import { Mail, MessageSquare, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Võta Kodu meeskonnaga ühendust.",
};

export default function KontaktPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Kontakt</h1>
      <p className="mt-3 text-muted-foreground">
        Küsimused, ettepanekud või abi? Kirjuta meile.
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mail className="size-5" />
            </span>
            <div>
              <p className="font-medium">E-post</p>
              <a href="mailto:tere@kodu.ee" className="text-sm text-primary hover:underline">
                tere@kodu.ee
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageSquare className="size-5" />
            </span>
            <div>
              <p className="font-medium">Klienditugi</p>
              <p className="text-sm text-muted-foreground">E–R 9:00–17:00</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MapPin className="size-5" />
            </span>
            <div>
              <p className="font-medium">Asukoht</p>
              <p className="text-sm text-muted-foreground">Tallinn, Eesti</p>
            </div>
          </div>
        </div>

        {/* Lihtne kontaktivorm — saadab e-kirja (mailto) */}
        <form
          action="mailto:tere@kodu.ee"
          method="post"
          encType="text/plain"
          className="flex flex-col gap-4 rounded-2xl border bg-card p-6"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nimi</Label>
            <Input id="name" name="name" required placeholder="Sinu nimi" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-post</Label>
            <Input id="email" name="email" type="email" required placeholder="sinu@email.ee" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="message">Sõnum</Label>
            <Textarea id="message" name="message" rows={5} required placeholder="Kuidas saame aidata?" />
          </div>
          <Button type="submit" className="self-start">
            Saada sõnum
          </Button>
        </form>
      </div>
    </div>
  );
}
