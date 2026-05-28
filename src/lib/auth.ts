import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/database.types";

// Tagastab praeguse autenditud kasutaja (auth.users) või null.
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Tagastab praeguse kasutaja profiili (public.profiles) või null.
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

// Nõuab sisselogitud kasutajat; muidu suunab sisselogimislehele.
export async function requireUser() {
  const user = await getUser();
  if (!user) {
    redirect("/sisene");
  }
  return user;
}

// Nõuab sisselogitud kasutaja profiili; muidu suunab.
export async function requireProfile(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) {
    redirect("/sisene");
  }
  return profile;
}
