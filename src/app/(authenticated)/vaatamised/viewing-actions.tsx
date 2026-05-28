"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setViewingStatus } from "./actions";
import type { ViewingStatus } from "@/lib/supabase/database.types";

export function ViewingActions({
  viewingId,
  status,
  role,
}: {
  viewingId: string;
  status: ViewingStatus;
  role: "seller" | "buyer";
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function run(status: ViewingStatus, msg: string) {
    start(async () => {
      const res = await setViewingStatus(viewingId, status);
      if (res.ok) {
        toast.success(msg);
        router.refresh();
      } else toast.error(res.error ?? "Tegevus ebaõnnestus");
    });
  }

  if (status === "cancelled") return null;

  return (
    <div className="flex gap-2">
      {role === "seller" && status === "pending" && (
        <Button size="sm" onClick={() => run("confirmed", "Vaatamine kinnitatud")} disabled={pending}>
          <Check className="size-4" /> Kinnita
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        onClick={() => run("cancelled", "Vaatamine tühistatud")}
        disabled={pending}
      >
        <X className="size-4" /> Tühista
      </Button>
    </div>
  );
}
