import Link from "next/link";
import { Home, Plus } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { getTotalUnread } from "@/lib/queries/conversations";
import { Button } from "@/components/ui/button";
import { SearchBar } from "./search-bar";
import { UserMenu } from "./user-menu";

export async function Header() {
  const profile = await getProfile();
  const unread = profile ? await getTotalUnread(profile.id) : 0;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-xl font-semibold text-primary"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Home className="size-4.5" />
          </span>
          <span className="hidden sm:inline">Kodu</span>
        </Link>

        <SearchBar className="mx-auto hidden w-full max-w-md md:block" />

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="default"
            className="hidden sm:inline-flex"
            nativeButton={false} render={<Link href="/lisa-kuulutus" />}
          >
            <Plus className="size-4" />
            Lisa kuulutus
          </Button>

          {profile ? (
            <UserMenu profile={profile} unread={unread} />
          ) : (
            <>
              <Button variant="ghost" nativeButton={false} render={<Link href="/sisene" />}>
                Logi sisse
              </Button>
              <Button
                variant="outline"
                className="hidden sm:inline-flex"
                nativeButton={false} render={<Link href="/registreeri" />}
              >
                Registreeru
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
