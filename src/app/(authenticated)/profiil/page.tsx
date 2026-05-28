import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export const metadata: Metadata = { title: "Profiil" };

export default function ProfiilPage() {
  return (
    <PagePlaceholder
      title="Profiil"
      description="Profiili seaded valmivad peagi."
    />
  );
}
