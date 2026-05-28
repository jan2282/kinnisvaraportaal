import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <span className="rounded-full bg-gold/15 px-4 py-1.5 text-sm font-medium text-gold-foreground">
        Kinnisvara ilma maaklerita
      </span>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
        Müü oma kodu ilma maaklerita
      </h1>
      <p className="max-w-md text-lg text-muted-foreground">
        Säästa kuni 8000 € komisjonitasult. Notar kinnitab iga tehingu.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" render={<Link href="/lisa-kuulutus" />}>
          Hakka müüma
        </Button>
        <Button size="lg" variant="outline" render={<Link href="/kuulutused" />}>
          Otsi kinnisvara
        </Button>
      </div>
    </main>
  );
}
