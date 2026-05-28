"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import {
  inquirySchema,
  offerSchema,
  viewingSchema,
} from "@/lib/validations/interactions";

export type ActionResult =
  | { ok: true; redirect?: string }
  | { ok: false; error: string };

// Esita küsimus → loob (või taaskasutab) inquiry ja lisab esimese sõnumi
export async function createInquiry(input: unknown): Promise<ActionResult> {
  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Vigased andmed" };
  }
  const user = await getUser();
  if (!user) return { ok: false, error: "Logi enne sisse" };

  const { listingId, sellerId, message } = parsed.data;
  if (user.id === sellerId) {
    return { ok: false, error: "Sa ei saa enda kuulutusele küsimust esitada" };
  }

  const supabase = await createClient();

  // Otsi olemasolevat vestlust
  const { data: existing } = await supabase
    .from("inquiries")
    .select("id")
    .eq("listing_id", listingId)
    .eq("buyer_id", user.id)
    .maybeSingle();

  let inquiryId = existing?.id;

  if (!inquiryId) {
    const { data: created, error } = await supabase
      .from("inquiries")
      .insert({
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: sellerId,
        message,
      })
      .select("id")
      .single();
    if (error || !created) {
      return { ok: false, error: "Küsimuse saatmine ebaõnnestus" };
    }
    inquiryId = created.id;
  }

  const { error: msgError } = await supabase.from("messages").insert({
    inquiry_id: inquiryId,
    sender_id: user.id,
    content: message,
  });
  if (msgError) {
    return { ok: false, error: "Sõnumi saatmine ebaõnnestus" };
  }

  revalidatePath("/sonumid");
  return { ok: true, redirect: "/sonumid" };
}

// Tee pakkumine
export async function createOffer(input: unknown): Promise<ActionResult> {
  const parsed = offerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Vigased andmed" };
  }
  const user = await getUser();
  if (!user) return { ok: false, error: "Logi enne sisse" };

  const { listingId, sellerId, amount, message } = parsed.data;
  if (user.id === sellerId) {
    return { ok: false, error: "Sa ei saa enda kuulutusele pakkumist teha" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("offers").insert({
    listing_id: listingId,
    buyer_id: user.id,
    seller_id: sellerId,
    amount,
    message: message || null,
  });
  if (error) {
    return { ok: false, error: "Pakkumise saatmine ebaõnnestus" };
  }

  revalidatePath("/pakkumised");
  return { ok: true, redirect: "/pakkumised" };
}

// Broneeri vaatamine
export async function createViewing(input: unknown): Promise<ActionResult> {
  const parsed = viewingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Vigased andmed" };
  }
  const user = await getUser();
  if (!user) return { ok: false, error: "Logi enne sisse" };

  const { listingId, sellerId, date, time } = parsed.data;
  if (user.id === sellerId) {
    return { ok: false, error: "Sa ei saa enda kuulutusele vaatamist broneerida" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("viewings").insert({
    listing_id: listingId,
    buyer_id: user.id,
    seller_id: sellerId,
    proposed_date: date,
    proposed_time: time,
  });
  if (error) {
    return { ok: false, error: "Vaatamise broneerimine ebaõnnestus" };
  }

  revalidatePath("/vaatamised");
  return { ok: true, redirect: "/vaatamised" };
}
