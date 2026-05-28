import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  getReceivedViewings,
  getMadeViewings,
  type ViewingWithRelations,
} from "@/lib/queries/viewings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ViewingActions } from "./viewing-actions";
import { formatDate } from "@/lib/format";
import { VIEWING_STATUS_LABELS } from "@/lib/constants";
import type { ViewingStatus } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Vaatamised" };

const STATUS_STYLE: Record<ViewingStatus, string> = {
  pending: "bg-gold/20 text-gold-foreground",
  confirmed: "bg-success/15 text-success",
  cancelled: "bg-muted text-muted-foreground",
};

function ViewingCard({
  viewing,
  role,
}: {
  viewing: ViewingWithRelations;
  role: "seller" | "buyer";
}) {
  const party = role === "seller" ? viewing.buyer : viewing.seller;
  return (
    <div className="flex flex-col gap-2 rounded-2xl border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/kuulutused/${viewing.listing_id}`}
          className="font-medium hover:underline"
        >
          {viewing.listing?.title ?? "Kuulutus"}
        </Link>
        <Badge className={cn("border-transparent", STATUS_STYLE[viewing.status])}>
          {VIEWING_STATUS_LABELS[viewing.status]}
        </Badge>
      </div>
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <CalendarDays className="size-4" />
        {formatDate(viewing.proposed_date)}
        {viewing.proposed_time && ` kell ${viewing.proposed_time}`}
      </p>
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPin className="size-4" />
        {role === "seller" ? "Ostja" : "Müüja"}: {party?.full_name || "Kasutaja"}
      </p>
      <div className="mt-1">
        <ViewingActions viewingId={viewing.id} status={viewing.status} role={role} />
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">
      <CalendarDays className="size-8" />
      {text}
    </div>
  );
}

export default async function VaatamisedPage() {
  const user = await requireUser();
  const [received, made] = await Promise.all([
    getReceivedViewings(user.id),
    getMadeViewings(user.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Vaatamised</h1>

      <Tabs defaultValue="received">
        <TabsList className="mb-6">
          <TabsTrigger value="received">
            Saadud {received.length > 0 && `(${received.length})`}
          </TabsTrigger>
          <TabsTrigger value="made">
            Minu soovid {made.length > 0 && `(${made.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received">
          {received.length === 0 ? (
            <EmptyState text="Sa pole veel vaatamissoove saanud." />
          ) : (
            <div className="flex flex-col gap-4">
              {received.map((v) => (
                <ViewingCard key={v.id} viewing={v} role="seller" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="made">
          {made.length === 0 ? (
            <EmptyState text="Sa pole veel vaatamisi broneerinud." />
          ) : (
            <div className="flex flex-col gap-4">
              {made.map((v) => (
                <ViewingCard key={v.id} viewing={v} role="buyer" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
