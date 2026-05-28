"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

export type MessageResult = { ok: boolean; error?: string };

async function isParticipant(inquiryId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inquiries")
    .select("buyer_id, seller_id")
    .eq("id", inquiryId)
    .maybeSingle();
  return data?.buyer_id === userId || data?.seller_id === userId;
}

export async function sendMessage(
  inquiryId: string,
  content: string
): Promise<MessageResult> {
  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "Sõnum on tühi" };

  const user = await getUser();
  if (!user) return { ok: false, error: "Logi sisse" };
  if (!(await isParticipant(inquiryId, user.id)))
    return { ok: false, error: "Puudub õigus" };

  const supabase = await createClient();
  const { error } = await supabase.from("messages").insert({
    inquiry_id: inquiryId,
    sender_id: user.id,
    content: trimmed,
  });
  if (error) return { ok: false, error: "Saatmine ebaõnnestus" };

  revalidatePath("/sõnumid");
  return { ok: true };
}

// Märgi vestluse vastaspoole sõnumid loetuks
export async function markConversationRead(
  inquiryId: string
): Promise<MessageResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Logi sisse" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("inquiry_id", inquiryId)
    .neq("sender_id", user.id)
    .eq("is_read", false);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/sõnumid");
  return { ok: true };
}
