import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare, ChevronLeft, ImageOff } from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  getConversations,
  getConversation,
  lastMessage,
  unreadCount,
  type ConversationListItem,
} from "@/lib/queries/conversations";
import { MessageThread } from "./message-thread";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Sõnumid" };

function otherParty(conv: ConversationListItem, userId: string) {
  return conv.buyer_id === userId ? conv.seller : conv.buyer;
}

function listingCover(conv: ConversationListItem): string | null {
  const imgs = conv.listing?.listing_images ?? [];
  if (imgs.length === 0) return null;
  return (imgs.find((i) => i.is_cover) ?? imgs[0]).url;
}

function partyInitials(name: string | null | undefined, email: string | undefined) {
  if (name) return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (email ?? "?").slice(0, 2).toUpperCase();
}

export default async function SonumidPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const user = await requireUser();
  const { c } = await searchParams;

  const conversations = await getConversations(user.id);
  const active = c ? await getConversation(c, user.id) : null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 px-0 sm:px-6 lg:px-8 sm:py-6">
      <div className="grid w-full overflow-hidden rounded-none border-y sm:rounded-2xl sm:border md:grid-cols-[340px_1fr]">
        {/* VESTLUSTE LOEND */}
        <aside
          className={cn(
            "flex flex-col border-r bg-card",
            active ? "hidden md:flex" : "flex"
          )}
        >
          <div className="border-b p-4">
            <h1 className="text-lg font-semibold">Sõnumid</h1>
          </div>
          {conversations.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground">
              <MessageSquare className="size-8" />
              Sul pole veel vestlusi.
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => {
                const other = otherParty(conv, user.id);
                const last = lastMessage(conv);
                const unread = unreadCount(conv, user.id);
                const cover = listingCover(conv);
                const isActive = conv.id === c;
                return (
                  <Link
                    key={conv.id}
                    href={`/sonumid?c=${conv.id}`}
                    className={cn(
                      "flex gap-3 border-b p-3 transition-colors hover:bg-secondary/50",
                      isActive && "bg-secondary"
                    )}
                  >
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {cover ? (
                        <Image src={cover} alt="" fill sizes="48px" className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <ImageOff className="size-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">
                          {other?.full_name || "Kasutaja"}
                        </span>
                        {last && (
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {formatRelative(last.created_at)}
                          </span>
                        )}
                      </div>
                      <span className="truncate text-xs text-muted-foreground">
                        {conv.listing?.title ?? "Kuulutus"}
                      </span>
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-muted-foreground">
                          {last?.content ?? "—"}
                        </span>
                        {unread > 0 && (
                          <Badge className="size-5 shrink-0 justify-center rounded-full bg-primary p-0 text-[10px] text-primary-foreground">
                            {unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </aside>

        {/* AKTIIVNE VESTLUS */}
        <section
          className={cn(
            "min-h-[60vh] flex-col bg-background md:flex md:min-h-[70vh]",
            active ? "flex" : "hidden md:flex"
          )}
        >
          {active ? (
            <>
              <div className="flex items-center gap-3 border-b p-3">
                <Link
                  href="/sonumid"
                  className="flex size-9 items-center justify-center rounded-full hover:bg-secondary md:hidden"
                >
                  <ChevronLeft className="size-5" />
                </Link>
                <Avatar className="size-9 border">
                  {otherParty(active, user.id)?.avatar_url && (
                    <AvatarImage src={otherParty(active, user.id)!.avatar_url!} alt="" />
                  )}
                  <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                    {partyInitials(
                      otherParty(active, user.id)?.full_name,
                      otherParty(active, user.id)?.email
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">
                    {otherParty(active, user.id)?.full_name || "Kasutaja"}
                  </span>
                  <Link
                    href={`/kuulutused/${active.listing_id}`}
                    className="truncate text-xs text-muted-foreground hover:underline"
                  >
                    {active.listing?.title ?? "Kuulutus"}
                  </Link>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <MessageThread
                  inquiryId={active.id}
                  initialMessages={active.messages}
                  offers={active.offers}
                  currentUserId={user.id}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
              <MessageSquare className="size-10" />
              <p>Vali vasakult vestlus</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
