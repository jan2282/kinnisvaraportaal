import { Badge } from "@/components/ui/badge";
import { LISTING_STATUS_LABELS } from "@/lib/constants";
import type { ListingStatus } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<ListingStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-success/15 text-success",
  under_offer: "bg-gold/20 text-gold-foreground",
  sold: "bg-primary/10 text-primary",
};

export function StatusBadge({ status }: { status: ListingStatus }) {
  return (
    <Badge className={cn("border-transparent", STATUS_STYLES[status])}>
      {LISTING_STATUS_LABELS[status]}
    </Badge>
  );
}
