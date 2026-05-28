import { createClient } from "@/lib/supabase/server";
import type { Viewing, Profile } from "@/lib/supabase/database.types";

type PartyMini = Pick<Profile, "id" | "full_name" | "email" | "avatar_url">;
type ListingMini = { id: string; title: string };

export type ViewingWithRelations = Viewing & {
  listing: ListingMini | null;
  buyer: PartyMini | null;
  seller: PartyMini | null;
};

const PARTY = "id, full_name, email, avatar_url";
const LISTING = "id, title";

export async function getReceivedViewings(
  sellerId: string
): Promise<ViewingWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("viewings")
    .select(
      `*,
       listing:listings!viewings_listing_id_fkey(${LISTING}),
       buyer:profiles!viewings_buyer_id_fkey(${PARTY})`
    )
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getReceivedViewings error:", error.message);
    return [];
  }
  return (data ?? []) as unknown as ViewingWithRelations[];
}

export async function getMadeViewings(
  buyerId: string
): Promise<ViewingWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("viewings")
    .select(
      `*,
       listing:listings!viewings_listing_id_fkey(${LISTING}),
       seller:profiles!viewings_seller_id_fkey(${PARTY})`
    )
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMadeViewings error:", error.message);
    return [];
  }
  return (data ?? []) as unknown as ViewingWithRelations[];
}
