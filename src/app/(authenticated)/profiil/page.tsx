import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getSavedListings } from "@/lib/queries/listings";
import { ProfileForm } from "./profile-form";
import { ListingCard } from "@/components/listings/listing-card";

export const metadata: Metadata = { title: "Profiil" };

export default async function ProfiilPage() {
  const profile = await requireProfile();
  const saved = await getSavedListings(profile.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Profiil</h1>

      <ProfileForm profile={profile} />

      <section className="mt-10">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Heart className="size-5" /> Salvestatud kuulutused
        </h2>
        {saved.length === 0 ? (
          <p className="rounded-2xl border border-dashed py-12 text-center text-sm text-muted-foreground">
            Sul pole veel salvestatud kuulutusi.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {saved.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
