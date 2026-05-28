"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { MoreVertical, Pencil, CheckCircle2, Eye, EyeOff, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { setListingStatus, deleteListing } from "./actions";
import type { ListingStatus } from "@/lib/supabase/database.types";

export function ListingRowActions({
  listingId,
  status,
}: {
  listingId: string;
  status: ListingStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, msg: string) {
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        toast.success(msg);
        router.refresh();
      } else {
        toast.error(res.error ?? "Tegevus ebaõnnestus");
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" disabled={pending} />}
      >
        <MoreVertical className="size-4" />
        <span className="sr-only">Tegevused</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem nativeButton={false} render={<Link href={`/lisa-kuulutus?edit=${listingId}`} />}>
          <Pencil className="size-4" /> Muuda
        </DropdownMenuItem>

        {status !== "active" && (
          <DropdownMenuItem
            onClick={() => run(() => setListingStatus(listingId, "active"), "Kuulutus avaldatud")}
          >
            <Eye className="size-4" /> Avalda
          </DropdownMenuItem>
        )}
        {status === "active" && (
          <DropdownMenuItem
            onClick={() => run(() => setListingStatus(listingId, "draft"), "Kuulutus peidetud")}
          >
            <EyeOff className="size-4" /> Peida (mustand)
          </DropdownMenuItem>
        )}
        {status !== "sold" && (
          <DropdownMenuItem
            onClick={() => run(() => setListingStatus(listingId, "sold"), "Märgitud müüduks")}
          >
            <CheckCircle2 className="size-4" /> Märgi müüduks
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            if (confirm("Kustuta kuulutus jäädavalt?"))
              run(() => deleteListing(listingId), "Kuulutus kustutatud");
          }}
        >
          <Trash2 className="size-4" /> Kustuta
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
