import { z } from "zod";

// Tühi string / null → undefined, muidu arv
const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
  z.number().optional()
);

const optionalInt = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
  z.number().int().optional()
);

export const listingImageSchema = z.object({
  url: z.string().url(),
  is_cover: z.boolean(),
});

export const listingFormSchema = z.object({
  // Step 1
  type: z.enum(["apartment", "house", "land", "commercial"], {
    message: "Vali objekti tüüp",
  }),
  // Step 2
  address: z.string().min(2, "Sisesta aadress"),
  city: z.string().min(1, "Sisesta linn"),
  parish: z.string().optional().or(z.literal("")),
  county: z.string().optional().or(z.literal("")),
  // Step 3
  rooms: optionalInt,
  size_m2: optionalNumber,
  floor: optionalInt,
  floors_total: optionalInt,
  year_built: optionalInt,
  condition: z
    .enum(["new", "renovated", "good", "needs_renovation"])
    .optional(),
  energy_class: z.enum(["A", "B", "C", "D", "E", "F", "G", "H"]).optional(),
  features: z.array(z.string()).default([]),
  // Step 4
  has_debt: z.boolean().default(false),
  has_co_owners: z.boolean().default(false),
  has_tenants: z.boolean().default(false),
  // Step 5
  price: optionalInt,
  // Step 6
  title: z
    .string()
    .min(5, "Pealkiri peab olema vähemalt 5 tähemärki")
    .max(120, "Pealkiri on liiga pikk"),
  description: z.string().max(4000).optional().or(z.literal("")),
  // Step 7
  images: z.array(listingImageSchema).default([]),
});

export type ListingFormValues = z.input<typeof listingFormSchema>;
export type ListingFormParsed = z.output<typeof listingFormSchema>;

// Väljad sammude kaupa (kasutatakse sammu valideerimiseks)
export const STEP_FIELDS: (keyof ListingFormValues)[][] = [
  ["type"], // 1
  ["address", "city", "parish", "county"], // 2
  ["rooms", "size_m2", "floor", "floors_total", "year_built", "condition", "energy_class", "features"], // 3
  ["has_debt", "has_co_owners", "has_tenants"], // 4
  ["price"], // 5
  ["title", "description"], // 6
  ["images"], // 7
  [], // 8 ülevaade
];
