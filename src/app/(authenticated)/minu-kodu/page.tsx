import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export const metadata: Metadata = { title: "Minu kuulutused" };

export default function MinuKoduPage() {
  return (
    <PagePlaceholder
      title="Minu kuulutused"
      description="Siia tuleb sinu müügilolevate kuulutuste ülevaade. Valmib peagi."
    />
  );
}
