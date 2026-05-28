import { z } from "zod";

export const inquirySchema = z.object({
  listingId: z.string().uuid(),
  sellerId: z.string().uuid(),
  message: z.string().min(5, "Sõnum peab olema vähemalt 5 tähemärki").max(2000),
});

export const offerSchema = z.object({
  listingId: z.string().uuid(),
  sellerId: z.string().uuid(),
  amount: z.coerce.number().int().positive("Sisesta korrektne summa"),
  message: z.string().max(2000).optional().or(z.literal("")),
});

export const viewingSchema = z.object({
  listingId: z.string().uuid(),
  sellerId: z.string().uuid(),
  date: z.string().min(1, "Vali kuupäev"),
  time: z.string().min(1, "Vali kellaaeg"),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
export type OfferInput = z.infer<typeof offerSchema>;
export type ViewingInput = z.infer<typeof viewingSchema>;
