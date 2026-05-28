import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export const metadata: Metadata = { title: "Vaatamised" };

export default function VaatamisedPage() {
  return (
    <PagePlaceholder
      title="Vaatamised"
      description="Vaatamiste broneeringud valmivad peagi."
    />
  );
}
