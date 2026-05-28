"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { useRealtimeMessages } from "@/hooks/use-realtime-messages";
import { sendMessage, markConversationRead } from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import { formatPrice } from "@/lib/format";
import { OFFER_STATUS_LABELS } from "@/lib/constants";
import type { Message, Offer } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

export function MessageThread({
  inquiryId,
  initialMessages,
  offers,
  currentUserId,
}: {
  inquiryId: string;
  initialMessages: Message[];
  offers: Offer[];
  currentUserId: string;
}) {
  const { messages } = useRealtimeMessages(inquiryId, initialMessages);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Keri alla uute sõnumite saabudes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Märgi loetuks vestluse avamisel
  useEffect(() => {
    markConversationRead(inquiryId);
  }, [inquiryId]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    setText("");
    startTransition(async () => {
      const res = await sendMessage(inquiryId, content);
      if (!res.ok) {
        toast.error(res.error ?? "Saatmine ebaõnnestus");
        setText(content);
      }
    });
  }

  // Liida sõnumid ja pakkumised ajateljele
  const timeline = [
    ...messages.map((m) => ({ kind: "message" as const, at: m.created_at, data: m })),
    ...offers.map((o) => ({ kind: "offer" as const, at: o.created_at, data: o })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {timeline.map((item) =>
          item.kind === "message" ? (
            <MessageBubble
              key={`m-${item.data.id}`}
              message={item.data}
              own={item.data.sender_id === currentUserId}
            />
          ) : (
            <OfferCard key={`o-${item.data.id}`} offer={item.data} />
          )
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Kirjuta sõnum..."
          className="h-11 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <Button type="submit" size="icon-lg" className="rounded-full" disabled={pending}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}

function MessageBubble({ message, own }: { message: Message; own: boolean }) {
  return (
    <div className={cn("flex", own ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
          own
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-secondary text-secondary-foreground"
        )}
      >
        <p className="whitespace-pre-line">{message.content}</p>
        <p
          className={cn(
            "mt-1 text-[10px]",
            own ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {formatDateTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}

function OfferCard({ offer }: { offer: Offer }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-1 rounded-xl border bg-gold/10 px-4 py-3 text-center text-sm">
      <span className="font-medium">Pakkumine: {formatPrice(offer.amount)}</span>
      <Badge variant="outline">{OFFER_STATUS_LABELS[offer.status]}</Badge>
    </div>
  );
}
