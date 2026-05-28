import { createClient } from "@/lib/supabase/server";
import type {
  Inquiry,
  Message,
  Profile,
  Offer,
} from "@/lib/supabase/database.types";

type PartyMini = Pick<Profile, "id" | "full_name" | "email" | "avatar_url">;
type ListingMini = {
  id: string;
  title: string;
  status: string;
  listing_images: { url: string; is_cover: boolean; order_index: number }[];
};

export type ConversationListItem = Inquiry & {
  listing: ListingMini | null;
  buyer: PartyMini | null;
  seller: PartyMini | null;
  messages: Pick<Message, "content" | "created_at" | "is_read" | "sender_id">[];
};

export type ConversationDetail = ConversationListItem & {
  messages: Message[];
  offers: Offer[];
};

const PARTY = "id, full_name, email, avatar_url";
const LISTING = "id, title, status, listing_images(url, is_cover, order_index)";

// Kõik kasutaja vestlused (ostja või müüjana)
export async function getConversations(
  userId: string
): Promise<ConversationListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select(
      `*,
       listing:listings!inquiries_listing_id_fkey(${LISTING}),
       buyer:profiles!inquiries_buyer_id_fkey(${PARTY}),
       seller:profiles!inquiries_seller_id_fkey(${PARTY}),
       messages(content, created_at, is_read, sender_id)`
    )
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getConversations error:", error.message);
    return [];
  }

  const items = (data ?? []) as unknown as ConversationListItem[];
  // Sorteeri viimase sõnumi järgi
  items.sort((a, b) => {
    const la = lastMessageTime(a);
    const lb = lastMessageTime(b);
    return lb - la;
  });
  return items;
}

// Üksik vestlus koos kõigi sõnumite ja pakkumistega
export async function getConversation(
  inquiryId: string,
  userId: string
): Promise<ConversationDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select(
      `*,
       listing:listings!inquiries_listing_id_fkey(${LISTING}),
       buyer:profiles!inquiries_buyer_id_fkey(${PARTY}),
       seller:profiles!inquiries_seller_id_fkey(${PARTY}),
       messages(*)`
    )
    .eq("id", inquiryId)
    .maybeSingle();

  if (error || !data) return null;
  const detail = data as unknown as ConversationDetail;
  if (detail.buyer_id !== userId && detail.seller_id !== userId) return null;

  detail.messages.sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Lae selle kuulutuse pakkumised ostja-müüja vahel
  const { data: offers } = await supabase
    .from("offers")
    .select("*")
    .eq("listing_id", detail.listing_id)
    .eq("buyer_id", detail.buyer_id)
    .order("created_at", { ascending: true });
  detail.offers = (offers ?? []) as Offer[];

  return detail;
}

export function lastMessage(conv: ConversationListItem) {
  if (!conv.messages || conv.messages.length === 0) return null;
  return conv.messages.reduce((latest, m) =>
    new Date(m.created_at) > new Date(latest.created_at) ? m : latest
  );
}

function lastMessageTime(conv: ConversationListItem): number {
  const m = lastMessage(conv);
  return m ? new Date(m.created_at).getTime() : new Date(conv.created_at).getTime();
}

export function unreadCount(conv: ConversationListItem, userId: string): number {
  return (conv.messages ?? []).filter(
    (m) => m.sender_id !== userId && !m.is_read
  ).length;
}

// Lugemata sõnumite koguarv (nav badge jaoks)
export async function getTotalUnread(userId: string): Promise<number> {
  const convs = await getConversations(userId);
  return convs.reduce((sum, c) => sum + unreadCount(c, userId), 0);
}
