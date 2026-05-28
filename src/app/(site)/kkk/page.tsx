import type { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "KKK",
  description: "Korduma kippuvad küsimused Kodu kinnisvaraplatvormi kohta.",
};

const FAQ = [
  {
    q: "Kui palju maksab kuulutuse lisamine?",
    a: "Kuulutuse lisamine ja avaldamine on tasuta. Soovi korral saad kuulutuse esile tõsta, et see paistaks otsingutulemustes paremini silma.",
  },
  {
    q: "Kui palju ma maakleritasult säästan?",
    a: "Maaklerid küsivad tavaliselt 2–4% müügihinnast. 200 000 € korteri puhul tähendab see kuni 8000 € säästu, mille saad endale jätta.",
  },
  {
    q: "Kas tehing on turvaline ilma maaklerita?",
    a: "Jah. Iga kinnisvaratehing kinnitatakse notari juures, kes kontrollib dokumendid, tagab tehingu õiguspärasuse ja korraldab kinnistusameti kande. Meie juhatame sind kogu protsessi vältel.",
  },
  {
    q: "Kuidas ma oma kodu õigesti hinnastan?",
    a: "Kuulutuse loomisel arvutame automaatselt ruutmeetri hinna ning tulevikus näitame ka piirkonna võrreldavaid müüke, et leiaksid õiglase turuhinna.",
  },
  {
    q: "Kes teeb fotod?",
    a: "Saad fotod ise üles laadida (kuni 20 tükki) või tellida meie kaudu professionaalse fotograafi, kes jäädvustab su kodu parimast küljest.",
  },
  {
    q: "Kuidas ostjaga suhtlemine käib?",
    a: "Kogu suhtlus toimub platvormil reaalajas. Ostjad saavad esitada küsimusi, broneerida vaatamisi ja teha pakkumisi. Sina otsustad, millele vastad.",
  },
  {
    q: "Mis juhtub, kui võtan pakkumise vastu?",
    a: "Pärast pakkumise vastuvõtmist avaneb sammhaaval juhend tehingu lõpuleviimiseks: notariga ühenduse võtmine, lepingu sõlmimine ja kinnistusameti kanne.",
  },
  {
    q: "Kas saan kuulutust hiljem muuta?",
    a: "Jah, saad kuulutust igal ajal muuta või selle ajutiselt peita oma töölaualt „Minu kuulutused”.",
  },
];

export default function KkkPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Korduma kippuvad küsimused
      </h1>
      <p className="mt-3 text-muted-foreground">
        Kõik, mida pead teadma kinnisvara müümisest ja ostmisest ilma maaklerita.
      </p>
      <div className="mt-8">
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
    </div>
  );
}
