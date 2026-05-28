// Seemneandmed: 2 demo müüjat ja 6 realistlikku Tallinna kuulutust.
// Käivita: pnpm db:seed
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import type { Database, ListingType, ListingCondition, EnergyClass } from "../src/lib/supabase/database.types";

config({ path: ".env.local" });

const admin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const img = (id: string) => `https://images.unsplash.com/${id}?w=1400&q=80&auto=format&fit=crop`;

type SellerSeed = {
  email: string;
  full_name: string;
  phone: string;
};

const SELLERS: SellerSeed[] = [
  { email: "kodu.seed.mari@gmail.com", full_name: "Mari Maasikas", phone: "+372 5512 3456" },
  { email: "kodu.seed.jaan@gmail.com", full_name: "Jaan Tamm", phone: "+372 5598 7654" },
];

type ListingSeed = {
  sellerIndex: number;
  title: string;
  description: string;
  address: string;
  city: string;
  parish: string;
  county: string;
  price: number;
  size_m2: number;
  rooms: number | null;
  floor: number | null;
  floors_total: number | null;
  year_built: number | null;
  type: ListingType;
  condition: ListingCondition;
  energy_class: EnergyClass;
  features: string[];
  images: string[];
};

const LISTINGS: ListingSeed[] = [
  {
    sellerIndex: 0,
    title: "Valgusküllane 2-toaline korter Kalamajas",
    description:
      "Võluv ja hoolikalt renoveeritud korter armastatud Kalamaja südames. Suured aknad toovad tuppa rohkelt loomulikku valgust ning avar planeering loob koduse õhkkonna. Maja on rahulikus tänavas, kõik vajalik – kohvikud, rand ja kesklinn – on jalutuskäigu kaugusel. Ideaalne kodu paarile või väikesele perele.",
    address: "Vabriku 12",
    city: "Tallinn",
    parish: "Põhja-Tallinn",
    county: "Harjumaa",
    price: 159000,
    size_m2: 54,
    rooms: 2,
    floor: 2,
    floors_total: 3,
    year_built: 1932,
    type: "apartment",
    condition: "renovated",
    energy_class: "C",
    features: ["balcony", "storage", "parking"],
    images: [
      img("photo-1502672260266-1c1ef2d93688"),
      img("photo-1493809842364-78817add7ffb"),
      img("photo-1484154218962-a197022b5858"),
      img("photo-1556912173-3bb406ef7e77"),
    ],
  },
  {
    sellerIndex: 1,
    title: "Moodne 3-toaline korter kesklinnas",
    description:
      "Eksklusiivne uusarenduse korter Tallinna kesklinnas. Kvaliteetne viimistlus, põrandaküte ja energiatõhus A-klassi maja. Avar elutuba ühendatud köögiga, kaks magamistuba ning klaasitud rõdu vaatega linnale. Majas on lift ja turvaline maa-alune parkla. Suurepärane valik nõudlikule ostjale.",
    address: "Tornimäe 5",
    city: "Tallinn",
    parish: "Kesklinn",
    county: "Harjumaa",
    price: 320000,
    size_m2: 78,
    rooms: 3,
    floor: 7,
    floors_total: 12,
    year_built: 2021,
    type: "apartment",
    condition: "new",
    energy_class: "A",
    features: ["balcony", "lift", "parking", "storage"],
    images: [
      img("photo-1545324418-cc1a3fa10c00"),
      img("photo-1560448204-e02f11c3d0e2"),
      img("photo-1586023492125-27b2c045efd7"),
      img("photo-1522708323590-d24dbb6b0267"),
    ],
  },
  {
    sellerIndex: 0,
    title: "Kompaktne 1-toaline korter Mustamäel",
    description:
      "Praktiline ja soodne ühetoaline korter heas korras majas. Sobib suurepäraselt esimeseks koduks või investeeringuks – piirkonnas on tugev üürinõudlus. Lähedal Tehnikaülikool, ühistransport ja kaubanduskeskused. Korter on kohe sissekolimisvalmis.",
    address: "Sõpruse pst 202",
    city: "Tallinn",
    parish: "Mustamäe",
    county: "Harjumaa",
    price: 85000,
    size_m2: 32,
    rooms: 1,
    floor: 4,
    floors_total: 9,
    year_built: 1979,
    type: "apartment",
    condition: "good",
    energy_class: "D",
    features: ["balcony", "lift"],
    images: [
      img("photo-1554995207-c18c203602cb"),
      img("photo-1505691938895-1758d7feb511"),
      img("photo-1567767292278-a4f21aa2d36e"),
    ],
  },
  {
    sellerIndex: 1,
    title: "Avar 4-toaline korter Kristiines – renoveerimist ootav potentsiaal",
    description:
      "Erakordselt avar neljatoaline korter rahulikus ja rohelises Kristiine linnaosas. Korter vajab kaasajastamist, kuid pakub haruldast võimalust luua oma unistuste kodu soovitud stiilis. Kõrged laed, originaalsed detailid ja suurepärane planeering. Hind arvestab renoveerimisvajadust.",
    address: "Tulika 19",
    city: "Tallinn",
    parish: "Kristiine",
    county: "Harjumaa",
    price: 175000,
    size_m2: 95,
    rooms: 4,
    floor: 1,
    floors_total: 4,
    year_built: 1958,
    type: "apartment",
    condition: "needs_renovation",
    energy_class: "E",
    features: ["storage", "parking"],
    images: [
      img("photo-1560185007-cde436f6a4d0"),
      img("photo-1502005229762-cf1b2da7c5d6"),
      img("photo-1484101403633-562f891dc89a"),
    ],
  },
  {
    sellerIndex: 0,
    title: "Hubane eramaja Nõmmel suure aiaga",
    description:
      "Klassikaline Nõmme eramaja küpses männimetsaga ümbritsetud krundil. Maja on heas korras, säilinud on autentne võlu. Avar elamispind kahel korrusel, saun, kamin ning hooldatud aed terrassiga. Vaikne ja privaatne, kuid samas mugavalt linnale lähedal. Tõeline perekodu.",
    address: "Männiku tee 88",
    city: "Tallinn",
    parish: "Nõmme",
    county: "Harjumaa",
    price: 295000,
    size_m2: 160,
    rooms: 5,
    floor: null,
    floors_total: 2,
    year_built: 1968,
    type: "house",
    condition: "good",
    energy_class: "C",
    features: ["sauna", "fireplace", "garden", "terrace", "parking"],
    images: [
      img("photo-1600585154340-be6161a56a0c"),
      img("photo-1600596542815-ffad4c1539a9"),
      img("photo-1600607687939-ce8a6c25118c"),
      img("photo-1600566753086-00f18fb6b3ea"),
    ],
  },
  {
    sellerIndex: 1,
    title: "Esinduslik äripind kesklinnas tänavatasandil",
    description:
      "Hea nähtavusega äripind elava tänava ääres kesklinnas. Suured vaateaknad, avatud planeering ja kõrge külastatavus muudavad selle ideaalseks kohvikule, salongile või kontorile. Värskelt korrastatud ruumid, eraldi sissepääs. Suurepärane asukoht äri kasvatamiseks.",
    address: "Pärnu mnt 41",
    city: "Tallinn",
    parish: "Kesklinn",
    county: "Harjumaa",
    price: 145000,
    size_m2: 65,
    rooms: 2,
    floor: 1,
    floors_total: 5,
    year_built: 1995,
    type: "commercial",
    condition: "renovated",
    energy_class: "C",
    features: ["storage"],
    images: [
      img("photo-1497366754035-f200968a6e72"),
      img("photo-1497366811353-6870744d04b2"),
      img("photo-1604328698692-f76ea9498e76"),
    ],
  },
];

async function ensureSeller(seed: SellerSeed): Promise<string> {
  // Otsi olemasolevat kasutajat e-posti järgi
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const existing = list?.users.find((u) => u.email === seed.email);
  if (existing) {
    // Kustuta olemasolevad kuulutused puhta seemnestamise jaoks
    await admin.from("listings").delete().eq("seller_id", existing.id);
    return existing.id;
  }

  const { data: created, error } = await admin.auth.admin.createUser({
    email: seed.email,
    password: "kodu-demo-1234",
    email_confirm: true,
    user_metadata: { full_name: seed.full_name, phone: seed.phone, role: "both" },
  });
  if (error || !created.user) throw new Error(`Kasutaja loomine ebaõnnestus: ${error?.message}`);
  return created.user.id;
}

async function main() {
  console.log("🌱 Seemnestan andmebaasi...\n");

  const sellerIds: string[] = [];
  for (const s of SELLERS) {
    const id = await ensureSeller(s);
    sellerIds.push(id);
    console.log(`✓ Müüja: ${s.full_name} (${id})`);
  }

  console.log("");
  for (const l of LISTINGS) {
    const seller_id = sellerIds[l.sellerIndex];

    const { data: listing, error } = await admin
      .from("listings")
      .insert({
        seller_id,
        title: l.title,
        description: l.description,
        address: l.address,
        city: l.city,
        parish: l.parish,
        county: l.county,
        price: l.price,
        size_m2: l.size_m2,
        rooms: l.rooms,
        floor: l.floor,
        floors_total: l.floors_total,
        year_built: l.year_built,
        type: l.type,
        condition: l.condition,
        energy_class: l.energy_class,
        status: "active",
      })
      .select()
      .single();

    if (error || !listing) {
      console.error(`❌ ${l.title}: ${error?.message}`);
      continue;
    }

    await admin.from("listing_images").insert(
      l.images.map((url, i) => ({
        listing_id: listing.id,
        url,
        order_index: i,
        is_cover: i === 0,
      }))
    );

    await admin.from("listing_features").insert(
      l.features.map((feature) => ({ listing_id: listing.id, feature }))
    );

    console.log(`✓ Kuulutus: ${l.title}`);
  }

  console.log("\n✅ Seemnestamine valmis! 6 kuulutust, 2 müüjat.");
  console.log("   Demo müüja login: kodu.seed.mari@gmail.com / kodu-demo-1234");
}

main().catch((e) => {
  console.error("\n❌ Seemnestamine ebaõnnestus:", e.message);
  process.exit(1);
});
