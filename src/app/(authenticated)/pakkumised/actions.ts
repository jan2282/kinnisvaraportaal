"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import type { ClosingProgress } from "@/lib/supabase/database.types";

export type OfferResult = { ok: boolean; error?: string };

async function getOfferParties(offerId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("offers")
    .select("buyer_id, seller_id, listing_id, closing_progress")
    .eq("id", offerId)
    .maybeSingle();
  return data;
}

// Müüja võtab pakkumise vastu → kuulutus 'under_offer', teised pakkumised tagasi lükatud
export async function acceptOffer(offerId: string): Promise<OfferResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Logi sisse" };

  const offer = await getOfferParties(offerId);
  if (!offer || offer.seller_id !== user.id)
    return { ok: false, error: "Puudub õigus" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("offers")
    .update({ status: "accepted" })
    .eq("id", offerId);
  if (error) return { ok: false, error: "Salvestamine ebaõnnestus" };

  // Lükka sama kuulutuse teised ootel pakkumised tagasi
  await supabase
    .from("offers")
    .update({ status: "rejected" })
    .eq("listing_id", offer.listing_id)
    .eq("status", "pending")
    .neq("id", offerId);

  // Märgi kuulutus pakkumise all olevaks
  await supabase
    .from("listings")
    .update({ status: "under_offer" })
    .eq("id", offer.listing_id);

  revalidatePath("/pakkumised");
  revalidatePath(`/tehing/${offerId}`);
  return { ok: true };
}

export async function rejectOffer(offerId: string): Promise<OfferResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Logi sisse" };

  const offer = await getOfferParties(offerId);
  if (!offer || offer.seller_id !== user.id)
    return { ok: false, error: "Puudub õigus" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("offers")
    .update({ status: "rejected" })
    .eq("id", offerId);
  if (error) return { ok: false, error: "Salvestamine ebaõnnestus" };

  revalidatePath("/pakkumised");
  return { ok: true };
}

export async function withdrawOffer(offerId: string): Promise<OfferResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Logi sisse" };

  const offer = await getOfferParties(offerId);
  if (!offer || offer.buyer_id !== user.id)
    return { ok: false, error: "Puudub õigus" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("offers")
    .update({ status: "withdrawn" })
    .eq("id", offerId);
  if (error) return { ok: false, error: "Salvestamine ebaõnnestus" };

  revalidatePath("/pakkumised");
  return { ok: true };
}

// Uuenda sulgemise checklist'i sammu (mõlemad osapooled)
export async function updateClosingStep(
  offerId: string,
  step: keyof ClosingProgress,
  done: boolean
): Promise<OfferResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Logi sisse" };

  const offer = await getOfferParties(offerId);
  if (!offer || (offer.buyer_id !== user.id && offer.seller_id !== user.id))
    return { ok: false, error: "Puudub õigus" };

  const current = (offer.closing_progress ?? {}) as ClosingProgress;
  const next = { ...current, [step]: done };

  const supabase = await createClient();
  const { error } = await supabase
    .from("offers")
    .update({ closing_progress: next })
    .eq("id", offerId);
  if (error) return { ok: false, error: "Salvestamine ebaõnnestus" };

  revalidatePath(`/tehing/${offerId}`);
  return { ok: true };
}
