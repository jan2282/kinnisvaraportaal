import { Header } from "./header";
import { Footer } from "./footer";
import { MobileNav } from "./mobile-nav";
import { getUser } from "@/lib/auth";
import { getTotalUnread } from "@/lib/queries/conversations";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  const unread = user ? await getTotalUnread(user.id) : 0;

  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
      <MobileNav unread={unread} />
    </div>
  );
}
