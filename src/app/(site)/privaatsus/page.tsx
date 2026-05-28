import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privaatsuspoliitika",
  description: "Kodu privaatsuspoliitika ja andmetöötluse põhimõtted.",
};

export default function PrivaatsusPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Privaatsuspoliitika</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Viimati uuendatud: 29. mai 2026
      </p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            1. Milliseid andmeid kogume
          </h2>
          <p>
            Kogume andmeid, mille sa ise sisestad: nimi, e-posti aadress, telefon
            ning kuulutuste ja vestluste sisu. Samuti salvestame tehnilisi andmeid,
            mis on vajalikud teenuse toimimiseks.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            2. Kuidas andmeid kasutame
          </h2>
          <p>
            Kasutame andmeid teenuse osutamiseks: kuulutuste kuvamiseks, ostja ja
            müüja vahelise suhtluse võimaldamiseks ning tehingute hõlbustamiseks.
            Me ei müü sinu andmeid kolmandatele osapooltele.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            3. Andmete jagamine
          </h2>
          <p>
            Sinu profiili põhiandmed (nimi, liitumiskuupäev) on nähtavad teistele
            kasutajatele, kellega suhtled. Vestluste sisu on nähtav ainult tehingu
            osapooltele.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            4. Sinu õigused
          </h2>
          <p>
            Sul on õigus oma andmeid vaadata, parandada ja kustutada. Konto
            kustutamiseks võta meiega ühendust.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">5. Kontakt</h2>
          <p>
            Privaatsusküsimustes kirjuta aadressile{" "}
            <a href="mailto:privaatsus@kodu.ee" className="text-primary hover:underline">
              privaatsus@kodu.ee
            </a>
            .
          </p>
        </section>

        <p className="rounded-lg bg-secondary/50 p-4 text-muted-foreground">
          See on näidisdokument MVP jaoks. Enne avalikku kasutust tuleb
          privaatsuspoliitika koostada koos juristiga ja viia vastavusse GDPR-iga.
        </p>
      </div>
    </div>
  );
}
