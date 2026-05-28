import { z } from "zod";

export const photographerSchema = z.object({
  name: z.string().min(2, "Sisesta nimi"),
  address: z.string().min(2, "Sisesta aadress"),
  preferred_dates: z
    .array(z.string())
    .min(1, "Lisa vähemalt üks sobiv kuupäev"),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export type PhotographerInput = z.infer<typeof photographerSchema>;
