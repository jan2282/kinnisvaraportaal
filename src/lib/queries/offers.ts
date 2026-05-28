import { createClient } from "@/lib/supabase/server";
import type { Offer, Profile } from "@/lib/supabase/database.types";

type PartyMini = Pick<Profile, "id" | "full_name" | "email" | "avatar_url">;
type ListingMini = {
  id: string;
  title: string;
  price: number | null;
  status: string;
  listing_images: { url: string; is_cover: boolean; order_index: number }[];
};

export type OfferWithRelations = Offer & {
  listing: ListingMini | null;
  buyer: PartyMini | null;
  seller: PartyMini | null;
};

const PARTY = "id, full_name, email, avatar_url";
const LISTING = "id, title, price, status, listing_images(url, is_cover, order_index)";

export async function getReceivedOffers(
  sellerId: string
): Promise<OfferWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offers")
    .select(
      `*,
       listing:listings!offers_listing_id_fkey(${LISTING}),
       buyer:profiles!offers_buyer_id_fkey(${PARTY})`
    )
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getReceivedOffers error:", error.message);
    return [];
  }
  return (data ?? []) as unknown as OfferWithRelations[];
}

export async function getMadeOffers(
  buyerId: string
): Promise<OfferWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offers")
    .select(
      `*,
       listing:listings!offers_listing_id_fkey(${LISTING}),
       seller:profiles!offers_seller_id_fkey(${PARTY})`
    )
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMadeOffers error:", error.message);
    return [];
  }
  return (data ?? []) as unknown as OfferWithRelations[];
}

export async function getOffer(
  offerId: string,
  userId: string
): Promise<OfferWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offers")
    .select(
      `*,
       listing:listings!offers_listing_id_fkey(${LISTING}),
       buyer:profiles!offers_buyer_id_fkey(${PARTY}),
       seller:profiles!offers_seller_id_fkey(${PARTY})`
    )
    .eq("id", offerId)
    .maybeSingle();

  if (error || !data) return null;
  const offer = data as unknown as OfferWithRelations;
  if (offer.buyer_id !== userId && offer.seller_id !== userId) return null;
  return offer;
}
