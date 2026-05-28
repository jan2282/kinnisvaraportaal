import {
  Car,
  Wind,
  Archive,
  Flame,
  ArrowUpDown,
  Trees,
  Sun,
  Bath,
  Check,
  type LucideIcon,
} from "lucide-react";

const FEATURE_ICONS: Record<string, LucideIcon> = {
  parking: Car,
  balcony: Wind,
  storage: Archive,
  sauna: Bath,
  lift: ArrowUpDown,
  garden: Trees,
  terrace: Sun,
  fireplace: Flame,
};

export function FeatureIcon({ feature }: { feature: string }) {
  const Icon = FEATURE_ICONS[feature] ?? Check;
  return <Icon className="size-5 text-primary" />;
}
