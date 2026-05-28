"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { updateProfile, updatePassword } from "./actions";
import type { Profile } from "@/lib/supabase/database.types";

function initials(name: string | null, email: string) {
  if (name)
    return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const supabase = createClient();
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [uploading, setUploading] = useState(false);
  const [savingProfile, startProfile] = useTransition();
  const [savingPw, startPw] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${profile.id}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (error) {
      toast.error("Pildi üleslaadimine ebaõnnestus");
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    setUploading(false);
    toast.success("Profiilipilt laetud — salvesta muudatused");
  }

  function onProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startProfile(async () => {
      const res = await updateProfile({
        full_name: String(fd.get("full_name") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        avatar_url: avatarUrl,
      });
      if (res.ok) toast.success("Profiil salvestatud");
      else toast.error(res.error ?? "Salvestamine ebaõnnestus");
    });
  }

  function onPasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startPw(async () => {
      const res = await updatePassword(String(fd.get("password") ?? ""));
      if (res.ok) {
        toast.success("Parool muudetud");
        form.reset();
      } else toast.error(res.error ?? "Parooli muutmine ebaõnnestus");
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* PROFIIL */}
      <form
        onSubmit={onProfileSubmit}
        className="flex flex-col gap-5 rounded-2xl border bg-card p-6"
      >
        <h2 className="text-lg font-semibold">Profiili andmed</h2>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative"
          >
            <Avatar className="size-20 border">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
              <AvatarFallback className="bg-primary/10 text-lg font-medium text-primary">
                {initials(profile.full_name, profile.email)}
              </AvatarFallback>
            </Avatar>
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              {uploading ? (
                <Loader2 className="size-5 animate-spin text-white" />
              ) : (
                <Camera className="size-5 text-white" />
              )}
            </span>
          </button>
          <div>
            <p className="text-sm font-medium">Profiilipilt</p>
            <p className="text-sm text-muted-foreground">Klõpsa pildi muutmiseks</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onAvatarChange}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="full_name">Nimi</Label>
          <Input id="full_name" name="full_name" defaultValue={profile.full_name ?? ""} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">E-post</Label>
          <Input id="email" value={profile.email} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={profile.phone ?? ""} placeholder="+372 5xxx xxxx" />
        </div>

        <Button type="submit" disabled={savingProfile} className="self-start">
          {savingProfile ? "Salvestan..." : "Salvesta muudatused"}
        </Button>
      </form>

      {/* PAROOL */}
      <form
        onSubmit={onPasswordSubmit}
        className="flex flex-col gap-5 rounded-2xl border bg-card p-6"
      >
        <h2 className="text-lg font-semibold">Muuda parooli</h2>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Uus parool</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            placeholder="Vähemalt 8 tähemärki"
          />
        </div>
        <Button type="submit" variant="outline" disabled={savingPw} className="self-start">
          {savingPw ? "Salvestan..." : "Muuda parooli"}
        </Button>
      </form>
    </div>
  );
}
