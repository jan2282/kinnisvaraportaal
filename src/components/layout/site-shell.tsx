import { Header } from "./header";
import { Footer } from "./footer";
import { MobileNav } from "./mobile-nav";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
      <MobileNav />
    </div>
  );
}
