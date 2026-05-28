import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export const metadata: Metadata = { title: "Lisa kuulutus" };

export default function LisaKuulutusPage() {
  return (
    <PagePlaceholder
      title="Lisa kuulutus"
      description="Kuulutuse lisamise vorm valmib peagi."
    />
  );
}
