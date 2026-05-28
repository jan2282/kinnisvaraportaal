import type { Metadata } from "next";
import Link from "next/link";
import { FileText, MessagesSquare, Handshake, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Kuidas toimib",
  description: "Kuidas müüa ja osta kinnisvara ilma maaklerita Kodu platvormil.",
};

const STEPS = [
  {
    icon: FileText,
    title: "1. Lisa kuulutus",
    text: "Loo kuulutus meie lihtsa sammhaaval vormiga. Lisa fotod, andmed ja hind. AI aitab kirjelduse koostada ning soovi korral saad tellida professionaalse fotograafi.",
  },
  {
    icon: MessagesSquare,
    title: "2. Suhtle ostjatega",
    text: "Ostjad saavad esitada küsimusi, broneerida vaatamisi ja teha pakkumisi otse platvormil. Kogu suhtlus on turvaline ja salvestatud.",
  },
  {
    icon: Handshake,
    title: "3. Sõlmi tehing",
    text: "Kui sobiv pakkumine on käes, juhatame sind sammhaaval notariaalse tehinguni. Notar kinnitab tehingu ja korraldab kinnistusameti kande.",
  },
];

export default function KuidasToimibPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Kuidas Kodu toimib</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Müü või osta kinnisvara otse, ilma maaklerita – ja säästa kuni 8000 €
        komisjonitasult.
      </p>

      <div className="mt-10 flex flex-col gap-6">
        {STEPS.map((step) => (
          <div key={step.title} className="flex gap-4 rounded-2xl border bg-card p-6">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <step.icon className="size-6" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">{step.title}</h2>
              <p className="mt-1 text-muted-foreground">{step.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-start gap-4 rounded-2xl bg-primary/5 p-6">
        <ShieldCheck className="size-6 shrink-0 text-primary" />
        <div>
          <h2 className="font-semibold">Turvaline iga sammu juures</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Iga tehing kinnitatakse notari juures. Kõik vestlused on salvestatud ja
            ligipääsetavad ainult tehingu osapooltele.
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" nativeButton={false} render={<Link href="/lisa-kuulutus" />}>
          Hakka müüma
        </Button>
        <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/kuulutused" />}>
          Otsi kinnisvara
        </Button>
      </div>
    </div>
  );
}
