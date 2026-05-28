"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import type { ViewingStatus } from "@/lib/supabase/database.types";

export type ViewingResult = { ok: boolean; error?: string };

async function getViewingParties(viewingId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("viewings")
    .select("buyer_id, seller_id")
    .eq("id", viewingId)
    .maybeSingle();
  return data;
}

export async function setViewingStatus(
  viewingId: string,
  status: ViewingStatus
): Promise<ViewingResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Logi sisse" };

  const v = await getViewingParties(viewingId);
  if (!v || (v.buyer_id !== user.id && v.seller_id !== user.id))
    return { ok: false, error: "Puudub õigus" };

  // Ainult müüja saab kinnitada; mõlemad saavad tühistada
  if (status === "confirmed" && v.seller_id !== user.id)
    return { ok: false, error: "Ainult müüja saab kinnitada" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("viewings")
    .update({ status })
    .eq("id", viewingId);
  if (error) return { ok: false, error: "Salvestamine ebaõnnestus" };

  revalidatePath("/vaatamised");
  return { ok: true };
}
