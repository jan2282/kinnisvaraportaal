import { createClient } from "@/lib/supabase/server";
import type {
  Listing,
  ListingImage,
  ListingFeature,
  Profile,
  ListingType,
} from "@/lib/supabase/database.types";

export type ListingCardData = Listing & {
  listing_images: Pick<ListingImage, "url" | "is_cover" | "order_index">[];
};

export type ListingDetail = Listing & {
  listing_images: ListingImage[];
  listing_features: ListingFeature[];
  seller: Profile | null;
};

export type ListingFilters = {
  q?: string;
  city?: string;
  type?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  rooms?: number;
  minSize?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "size_desc";
};

const CARD_SELECT = "*, listing_images(url, is_cover, order_index)";

// Aktiivsed kuulutused filtrite ja sorteerimisega (sirvimisleht)
export async function getActiveListings(
  filters: ListingFilters = {}
): Promise<ListingCardData[]> {
  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select(CARD_SELECT)
    .eq("status", "active");

  if (filters.city) query = query.eq("city", filters.city);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.minPrice != null) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice != null) query = query.lte("price", filters.maxPrice);
  if (filters.rooms != null) query = query.gte("rooms", filters.rooms);
  if (filters.minSize != null) query = query.gte("size_m2", filters.minSize);
  if (filters.q) {
    const term = `%${filters.q}%`;
    query = query.or(
      `title.ilike.${term},address.ilike.${term},city.ilike.${term},parish.ilike.${term}`
    );
  }

  switch (filters.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true, nullsFirst: false });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false, nullsFirst: false });
      break;
    case "size_desc":
      query = query.order("size_m2", { ascending: false, nullsFirst: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    console.error("getActiveListings error:", error.message);
    return [];
  }
  return (data ?? []) as ListingCardData[];
}

// Värsked kuulutused (avaleht)
export async function getRecentListings(limit = 6): Promise<ListingCardData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(CARD_SELECT)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getRecentListings error:", error.message);
    return [];
  }
  return (data ?? []) as ListingCardData[];
}

// Üksiku kuulutuse täisandmed (detailvaade)
export async function getListingById(
  id: string
): Promise<ListingDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "*, listing_images(*), listing_features(*), seller:profiles!listings_seller_id_fkey(*)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getListingById error:", error.message);
    return null;
  }
  if (!data) return null;

  const detail = data as unknown as ListingDetail;
  detail.listing_images.sort((a, b) => a.order_index - b.order_index);
  return detail;
}

// Sarnased kuulutused (sama linn + tüüp)
export async function getSimilarListings(
  listing: Pick<Listing, "id" | "city" | "type">,
  limit = 4
): Promise<ListingCardData[]> {
  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select(CARD_SELECT)
    .eq("status", "active")
    .eq("type", listing.type)
    .neq("id", listing.id)
    .limit(limit);

  if (listing.city) query = query.eq("city", listing.city);

  const { data, error } = await query;
  if (error) {
    console.error("getSimilarListings error:", error.message);
    return [];
  }
  return (data ?? []) as ListingCardData[];
}

export type SellerListing = Listing & {
  listing_images: Pick<ListingImage, "url" | "is_cover" | "order_index">[];
  inquiries: { count: number }[];
  offers: { count: number }[];
};

// Müüja kõik kuulutused koos päringute/pakkumiste arvuga (dashboard)
export async function getSellerListings(
  sellerId: string
): Promise<SellerListing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "*, listing_images(url, is_cover, order_index), inquiries(count), offers(count)"
    )
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getSellerListings error:", error.message);
    return [];
  }
  return (data ?? []) as unknown as SellerListing[];
}

// Kasutaja salvestatud kuulutused (lemmikud)
export async function getSavedListings(
  userId: string
): Promise<ListingCardData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_listings")
    .select("listing:listings(*, listing_images(url, is_cover, order_index))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getSavedListings error:", error.message);
    return [];
  }
  return (data ?? [])
    .map((row) => (row as unknown as { listing: ListingCardData }).listing)
    .filter(Boolean);
}

export function coverImage(listing: ListingCardData): string | null {
  const imgs = listing.listing_images ?? [];
  if (imgs.length === 0) return null;
  const cover = imgs.find((i) => i.is_cover);
  return (cover ?? imgs[0]).url;
}
