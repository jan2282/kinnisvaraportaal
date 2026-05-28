import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export const metadata: Metadata = { title: "Pakkumised" };

export default function PakkumisedPage() {
  return (
    <PagePlaceholder
      title="Pakkumised"
      description="Saadud ja tehtud pakkumised valmivad peagi."
    />
  );
}
