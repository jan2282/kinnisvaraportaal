import Link from "next/link";
import {
  FileText,
  MessagesSquare,
  Handshake,
  ShieldCheck,
  Archive,
  Camera,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ListingCard } from "@/components/listings/listing-card";
import { getRecentListings } from "@/lib/queries/listings";

const STEPS = [
  {
    icon: FileText,
    title: "Lisa kuulutus",
    text: "Loo professionaalne kuulutus minutitega. AI aitab kirjelduse koostada ja tellida saab profifotograafi.",
  },
  {
    icon: MessagesSquare,
    title: "Suhtle ostjatega",
    text: "Vasta küsimustele, lepi kokku vaatamised ja võta vastu pakkumisi – kõik ühes turvalises keskkonnas.",
  },
  {
    icon: Handshake,
    title: "Sõlmi tehing",
    text: "Kui pakkumine sobib, juhatame sind sammhaaval notariaalse tehinguni. Ilma maaklerita.",
  },
];

const TRUST = [
  { icon: ShieldCheck, title: "Notar kinnitab iga tehingu", text: "Iga müük lõpeb turvalise notariaalse lepinguga." },
  { icon: Archive, title: "Kõik vestlused salvestatud", text: "Suhtlus ostjaga on alati alles ja jälgitav." },
  { icon: Camera, title: "Profifotograaf kohale", text: "Telli kvaliteetsed fotod, mis müüvad kiiremini." },
];

const FAQ = [
  {
    q: "Kui palju ma maakleritasult säästan?",
    a: "Maaklerid küsivad tavaliselt 2–4% müügihinnast. 200 000 € korteri puhul tähendab see kuni 8000 € säästu, mille saad endale jätta.",
  },
  {
    q: "Kas tehing on turvaline ilma maaklerita?",
    a: "Jah. Kinnisvaratehing kinnitatakse alati notari juures, kes kontrollib dokumendid ja tagab tehingu õiguspärasuse. Meie juhatame sind kogu protsessi vältel.",
  },
  {
    q: "Kuidas ma oma kodu õigesti hinnastan?",
    a: "Kuulutuse loomisel näitame sulle piirkonna võrreldavaid müüke ja arvutame automaatselt ruutmeetri hinna, et leiaksid õiglase turuhinna.",
  },
  {
    q: "Kes teeb fotod?",
    a: "Saad fotod ise üles laadida või tellida meie kaudu professionaalse fotograafi, kes jäädvustab su kodu parimast küljest.",
  },
  {
    q: "Mida pean ostja kohta teadma?",
    a: "Kogu suhtlus toimub platvormil ja jääb alles. Näed ostja profiili ning saad rahulikult küsimustele vastata enne vaatamise või pakkumise kokkuleppimist.",
  },
];

export default async function LandingPage() {
  const recent = await getRecentListings(6);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 lg:py-28">
          <span className="rounded-full bg-gold/15 px-4 py-1.5 text-sm font-medium text-gold-foreground">
            Kinnisvara ilma maaklerita
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-primary sm:text-5xl lg:text-6xl">
            Müü oma kodu ilma maaklerita
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Säästa kuni 8000 € komisjonitasult. Suhtle ostjatega otse ja sõlmi
            tehing turvaliselt notari juures.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/lisa-kuulutus" />}>
              Hakka müüma
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/kuulutused" />}>
              Otsi kinnisvara
            </Button>
          </div>
        </div>
      </section>

      {/* KUIDAS TOIMIB */}
      <section className="border-t bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Kuidas see toimib</h2>
            <p className="mt-2 text-muted-foreground">Kolm lihtsat sammu oma koduni</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex flex-col items-center gap-4 text-center">
                <div className="relative">
                  <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <step.icon className="size-7" />
                  </span>
                  <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-gold-foreground">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USALDUSSIGNAALID */}
      <section className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="grid gap-6 md:grid-cols-3">
            {TRUST.map((t) => (
              <div
                key={t.title}
                className="flex flex-col gap-3 rounded-2xl border bg-card p-6"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <t.icon className="size-6" />
                </span>
                <h3 className="font-semibold">{t.title}</h3>
                <p className="text-sm text-muted-foreground">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VÄRSKED KUULUTUSED */}
      {recent.length > 0 && (
        <section className="border-t bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight">Värsked kuulutused</h2>
                <p className="mt-2 text-muted-foreground">Hiljuti lisatud kodud</p>
              </div>
              <Link
                href="/kuulutused"
                className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
              >
                Vaata kõiki <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* KKK */}
      <section className="border-t">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Korduma kippuvad küsimused</h2>
          </div>
          <Accordion>
            {FAQ.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 lg:py-20">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight">
            Valmis oma kodu müüma?
          </h2>
          <p className="max-w-md text-primary-foreground/80">
            Loo kuulutus juba täna ja jõua otse ostjateni.
          </p>
          <Button
            size="lg"
            className="bg-gold text-gold-foreground hover:bg-gold/90"
            render={<Link href="/lisa-kuulutus" />}
          >
            Lisa kuulutus tasuta
          </Button>
        </div>
      </section>
    </>
  );
}
