"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

export type ProfileResult = { ok: boolean; error?: string };

export async function updateProfile(input: {
  full_name: string;
  phone: string;
  avatar_url?: string | null;
}): Promise<ProfileResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Logi sisse" };
  if (input.full_name.trim().length < 2)
    return { ok: false, error: "Sisesta nimi" };

  const supabase = await createClient();
  const update: Partial<{
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
  }> = {
    full_name: input.full_name.trim(),
    phone: input.phone.trim() || null,
  };
  if (input.avatar_url !== undefined) update.avatar_url = input.avatar_url;

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id);
  if (error) return { ok: false, error: "Salvestamine ebaõnnestus" };

  revalidatePath("/profiil");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updatePassword(
  password: string
): Promise<ProfileResult> {
  if (password.length < 8)
    return { ok: false, error: "Parool peab olema vähemalt 8 tähemärki" };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: "Parooli muutmine ebaõnnestus" };

  return { ok: true };
}

export async function removeSaved(listingId: string): Promise<ProfileResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Logi sisse" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("saved_listings")
    .delete()
    .eq("user_id", user.id)
    .eq("listing_id", listingId);
  if (error) return { ok: false, error: "Eemaldamine ebaõnnestus" };

  revalidatePath("/profiil");
  return { ok: true };
}
