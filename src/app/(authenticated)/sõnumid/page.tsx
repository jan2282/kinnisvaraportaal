import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export const metadata: Metadata = { title: "Sõnumid" };

export default function SonumidPage() {
  return (
    <PagePlaceholder
      title="Sõnumid"
      description="Vestlused ostjate ja müüjatega valmivad peagi."
    />
  );
}
