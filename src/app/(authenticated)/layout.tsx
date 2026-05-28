import { requireUser } from "@/lib/auth";
import { SiteShell } from "@/components/layout/site-shell";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Suunab sisselogimislehele kui kasutaja pole autenditud
  await requireUser();

  return <SiteShell>{children}</SiteShell>;
}
