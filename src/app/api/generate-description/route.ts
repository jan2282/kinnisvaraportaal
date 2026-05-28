import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getUser } from "@/lib/auth";
import {
  LISTING_TYPE_LABELS,
  LISTING_CONDITION_LABELS,
  FEATURE_LABELS,
} from "@/lib/constants";
import type {
  ListingType,
  ListingCondition,
} from "@/lib/supabase/database.types";

export const maxDuration = 30;

// Lihtne in-memory rate limit (5 päringut minutis kasutaja kohta)
const rateMap = new Map<string, number[]>();
const LIMIT = 5;
const WINDOW = 60_000;

function rateLimited(userId: string): boolean {
  const now = Date.now();
  const hits = (rateMap.get(userId) ?? []).filter((t) => now - t < WINDOW);
  if (hits.length >= LIMIT) return true;
  hits.push(now);
  rateMap.set(userId, hits);
  return false;
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Logi sisse" }, { status: 401 });
  }
  if (rateLimited(user.id)) {
    return NextResponse.json(
      { error: "Liiga palju päringuid. Oota hetk ja proovi uuesti." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Vigane päring" }, { status: 400 });
  }

  const type = body.type as ListingType | undefined;
  const condition = body.condition as ListingCondition | undefined;
  const features = Array.isArray(body.features) ? (body.features as string[]) : [];

  // Koosta kinnisvara detailide kirjeldus prompti jaoks
  const details = [
    type && `Tüüp: ${LISTING_TYPE_LABELS[type]}`,
    body.rooms && `Tube: ${body.rooms}`,
    body.size_m2 && `Pindala: ${body.size_m2} m²`,
    body.floor && `Korrus: ${body.floor}${body.floors_total ? `/${body.floors_total}` : ""}`,
    body.year_built && `Ehitusaasta: ${body.year_built}`,
    condition && `Seisukord: ${LISTING_CONDITION_LABELS[condition]}`,
    body.energy_class && `Energiaklass: ${body.energy_class}`,
    body.city && `Linn: ${body.city}`,
    body.parish && `Linnaosa: ${body.parish}`,
    body.address && `Aadress: ${body.address}`,
    features.length > 0 &&
      `Lisaväärtused: ${features.map((f) => FEATURE_LABELS[f] ?? f).join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");

  if (!details) {
    return NextResponse.json(
      { error: "Täida esmalt kuulutuse andmed" },
      { status: 400 }
    );
  }

  try {
    const { text } = await generateText({
      model: "anthropic/claude-sonnet-4-6",
      prompt: `Sa oled Eesti kinnisvaraekspert. Kirjuta soe, professionaalne ja müüv kuulutuse kirjeldus järgmise kinnisvara kohta:\n\n${details}\n\nKirjeldus peaks olema 150-200 sõna, eesti keeles, positiivne toon, mainima peamisi eeliseid. Ära kasuta turunduslikke klišeesid ega liialdusi. Tagasta ainult kirjeldus, ilma pealkirja või lisamärkusteta.`,
    });

    return NextResponse.json({ description: text.trim() });
  } catch (err) {
    console.error("generate-description error:", err);
    return NextResponse.json(
      { error: "Kirjelduse genereerimine ebaõnnestus. Proovi hiljem uuesti." },
      { status: 500 }
    );
  }
}
