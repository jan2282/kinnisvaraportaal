"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { listingFormSchema } from "@/lib/validations/listing";
import { photographerSchema } from "@/lib/validations/photographer";

export type SaveResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function saveListing(
  values: unknown,
  options: { editId?: string; status: "draft" | "active" }
): Promise<SaveResult> {
  const parsed = listingFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Vigased andmed" };
  }

  const user = await getUser();
  if (!user) return { ok: false, error: "Logi sisse" };

  const supabase = await createClient();
  const v = parsed.data;

  const listingData = {
    seller_id: user.id,
    title: v.title,
    description: v.description || null,
    address: v.address,
    city: v.city,
    parish: v.parish || null,
    county: v.county || null,
    price: v.price ?? null,
    size_m2: v.size_m2 ?? null,
    rooms: v.rooms ?? null,
    floor: v.floor ?? null,
    floors_total: v.floors_total ?? null,
    year_built: v.year_built ?? null,
    type: v.type,
    condition: v.condition ?? null,
    energy_class: v.energy_class ?? null,
    has_debt: v.has_debt,
    has_co_owners: v.has_co_owners,
    has_tenants: v.has_tenants,
    status: options.status,
  };

  let listingId = options.editId;

  if (listingId) {
    // Kontrolli omandit
    const { data: existing } = await supabase
      .from("listings")
      .select("seller_id")
      .eq("id", listingId)
      .maybeSingle();
    if (existing?.seller_id !== user.id) {
      return { ok: false, error: "Puudub õigus seda kuulutust muuta" };
    }

    const { error } = await supabase
      .from("listings")
      .update(listingData)
      .eq("id", listingId);
    if (error) return { ok: false, error: "Salvestamine ebaõnnestus" };

    // Asenda pildid ja lisaväärtused
    await supabase.from("listing_images").delete().eq("listing_id", listingId);
    await supabase.from("listing_features").delete().eq("listing_id", listingId);
  } else {
    const { data: created, error } = await supabase
      .from("listings")
      .insert(listingData)
      .select("id")
      .single();
    if (error || !created) {
      return { ok: false, error: "Kuulutuse loomine ebaõnnestus" };
    }
    listingId = created.id;
  }

  if (v.images.length > 0) {
    const { error: imgError } = await supabase.from("listing_images").insert(
      v.images.map((img, i) => ({
        listing_id: listingId!,
        url: img.url,
        order_index: i,
        is_cover: img.is_cover || i === 0,
      }))
    );
    if (imgError) console.error("listing_images insert:", imgError.message);
  }

  if (v.features.length > 0) {
    const { error: featError } = await supabase
      .from("listing_features")
      .insert(v.features.map((feature) => ({ listing_id: listingId!, feature })));
    if (featError) console.error("listing_features insert:", featError.message);
  }

  revalidatePath("/minu-kodu");
  revalidatePath("/kuulutused");
  if (options.editId) revalidatePath(`/kuulutused/${listingId}`);

  return { ok: true, id: listingId! };
}

export async function requestPhotographer(
  values: unknown
): Promise<{ ok: boolean; error?: string }> {
  const parsed = photographerSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Vigased andmed" };
  }
  const user = await getUser();
  if (!user) return { ok: false, error: "Logi sisse" };

  const supabase = await createClient();
  const v = parsed.data;
  const { error } = await supabase.from("photographer_bookings").insert({
    seller_id: user.id,
    name: v.name,
    address: v.address,
    preferred_dates: v.preferred_dates.filter(Boolean),
    notes: v.notes || null,
  });
  if (error) return { ok: false, error: "Broneeringu salvestamine ebaõnnestus" };

  return { ok: true };
}
