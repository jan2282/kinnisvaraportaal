"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  MessageSquare,
  HandCoins,
  CalendarDays,
  User,
  LogOut,
} from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import type { Profile } from "@/lib/supabase/database.types";

function initials(name: string | null, email: string) {
  if (name) {
    return name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

const MENU_LINKS = [
  { href: "/minu-kodu", label: "Minu kuulutused", icon: LayoutDashboard },
  { href: "/sonumid", label: "Sõnumid", icon: MessageSquare },
  { href: "/pakkumised", label: "Pakkumised", icon: HandCoins },
  { href: "/vaatamised", label: "Vaatamised", icon: CalendarDays },
  { href: "/profiil", label: "Profiil", icon: User },
];

export function UserMenu({
  profile,
  unread = 0,
}: {
  profile: Profile;
  unread?: number;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="size-9 border">
          {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt="" />}
          <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
            {initials(profile.full_name, profile.email)}
          </AvatarFallback>
        </Avatar>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-background bg-primary" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-medium">{profile.full_name || "Kasutaja"}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {profile.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {MENU_LINKS.map((link) => (
          <DropdownMenuItem key={link.href} render={<Link href={link.href} />}>
            <link.icon className="size-4" />
            {link.label}
            {link.href === "/sonumid" && unread > 0 && (
              <span className="ml-auto flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => signOut()}>
          <LogOut className="size-4" />
          Logi välja
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
