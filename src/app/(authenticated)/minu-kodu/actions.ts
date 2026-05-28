"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import type { ListingStatus } from "@/lib/supabase/database.types";

export type ListingActionResult = { ok: boolean; error?: string };

async function ownsListing(listingId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("seller_id")
    .eq("id", listingId)
    .maybeSingle();
  return data?.seller_id === userId;
}

export async function setListingStatus(
  listingId: string,
  status: ListingStatus
): Promise<ListingActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Logi sisse" };
  if (!(await ownsListing(listingId, user.id)))
    return { ok: false, error: "Puudub õigus" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("listings")
    .update({ status })
    .eq("id", listingId);
  if (error) return { ok: false, error: "Salvestamine ebaõnnestus" };

  revalidatePath("/minu-kodu");
  revalidatePath(`/kuulutused/${listingId}`);
  return { ok: true };
}

export async function deleteListing(
  listingId: string
): Promise<ListingActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Logi sisse" };
  if (!(await ownsListing(listingId, user.id)))
    return { ok: false, error: "Puudub õigus" };

  const supabase = await createClient();
  const { error } = await supabase.from("listings").delete().eq("id", listingId);
  if (error) return { ok: false, error: "Kustutamine ebaõnnestus" };

  revalidatePath("/minu-kodu");
  return { ok: true };
}
