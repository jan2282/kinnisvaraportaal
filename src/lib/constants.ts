import type {
  ListingType,
  ListingCondition,
  ListingStatus,
  OfferStatus,
  ViewingStatus,
  EnergyClass,
} from "@/lib/supabase/database.types";

// Eestikeelsed sildid enumidele

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  apartment: "Korter",
  house: "Maja",
  land: "Maatükk",
  commercial: "Äripind",
};

export const LISTING_TYPE_OPTIONS: { value: ListingType; label: string; description: string }[] = [
  { value: "apartment", label: "Korter", description: "Korter kortermajas" },
  { value: "house", label: "Maja", description: "Eramu, ridaelamu või paarismaja" },
  { value: "land", label: "Maatükk", description: "Ehitusmaa või põllumaa" },
  { value: "commercial", label: "Äripind", description: "Büroo, kauplus või ladu" },
];

export const LISTING_CONDITION_LABELS: Record<ListingCondition, string> = {
  new: "Uus",
  renovated: "Renoveeritud",
  good: "Heas korras",
  needs_renovation: "Vajab renoveerimist",
};

export const LISTING_CONDITION_OPTIONS: {
  value: ListingCondition;
  label: string;
  description: string;
}[] = [
  { value: "new", label: "Uus", description: "Uusarendus või kasutamata" },
  { value: "renovated", label: "Renoveeritud", description: "Hiljuti uuendatud" },
  { value: "good", label: "Heas korras", description: "Korralik, valmis sisse kolimiseks" },
  {
    value: "needs_renovation",
    label: "Vajab renoveerimist",
    description: "Vajab uuendustöid",
  },
];

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  draft: "Mustand",
  active: "Aktiivne",
  under_offer: "Pakkumise all",
  sold: "Müüdud",
};

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  pending: "Ootel",
  accepted: "Vastu võetud",
  rejected: "Tagasi lükatud",
  withdrawn: "Tagasi võetud",
};

export const VIEWING_STATUS_LABELS: Record<ViewingStatus, string> = {
  pending: "Ootel",
  confirmed: "Kinnitatud",
  cancelled: "Tühistatud",
};

export const ENERGY_CLASSES: EnergyClass[] = ["A", "B", "C", "D", "E", "F", "G", "H"];

// Levinumad lisaväärtused (features)
export const FEATURE_OPTIONS: { value: string; label: string }[] = [
  { value: "parking", label: "Parkimiskoht" },
  { value: "balcony", label: "Rõdu" },
  { value: "storage", label: "Panipaik" },
  { value: "sauna", label: "Saun" },
  { value: "lift", label: "Lift" },
  { value: "garden", label: "Aed" },
  { value: "terrace", label: "Terrass" },
  { value: "fireplace", label: "Kamin" },
];

export const FEATURE_LABELS: Record<string, string> = Object.fromEntries(
  FEATURE_OPTIONS.map((f) => [f.value, f.label])
);

// Eesti suuremad linnad/piirkonnad filtriks
export const CITY_OPTIONS = [
  "Tallinn",
  "Tartu",
  "Pärnu",
  "Narva",
  "Kohtla-Järve",
  "Viljandi",
  "Rakvere",
  "Maardu",
  "Kuressaare",
  "Võru",
];

export const TALLINN_DISTRICTS = [
  "Kesklinn",
  "Põhja-Tallinn",
  "Mustamäe",
  "Kristiine",
  "Lasnamäe",
  "Nõmme",
  "Haabersti",
  "Pirita",
];
