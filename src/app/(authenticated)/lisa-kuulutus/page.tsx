import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getListingById } from "@/lib/queries/listings";
import { ListingForm } from "./listing-form";

export const metadata: Metadata = { title: "Lisa kuulutus" };

export default async function LisaKuulutusPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const user = await requireUser();
  const { edit } = await searchParams;

  let initial = undefined;
  if (edit) {
    const listing = await getListingById(edit);
    if (!listing || listing.seller_id !== user.id) {
      redirect("/minu-kodu");
    }
    initial = {
      type: listing.type,
      address: listing.address ?? "",
      city: listing.city ?? "",
      parish: listing.parish ?? "",
      county: listing.county ?? "Harjumaa",
      rooms: listing.rooms?.toString() ?? "",
      size_m2: listing.size_m2?.toString() ?? "",
      floor: listing.floor?.toString() ?? "",
      floors_total: listing.floors_total?.toString() ?? "",
      year_built: listing.year_built?.toString() ?? "",
      condition: listing.condition ?? undefined,
      energy_class: listing.energy_class ?? undefined,
      features: listing.listing_features.map((f) => f.feature),
      has_debt: listing.has_debt,
      has_co_owners: listing.has_co_owners,
      has_tenants: listing.has_tenants,
      price: listing.price?.toString() ?? "",
      title: listing.title,
      description: listing.description ?? "",
      images: listing.listing_images.map((img) => ({
        url: img.url,
        is_cover: img.is_cover,
      })),
    };
  }

  return (
    <ListingForm initial={initial} editId={edit} />
  );
}
