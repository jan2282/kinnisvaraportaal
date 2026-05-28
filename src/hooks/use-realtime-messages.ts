"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/lib/supabase/database.types";

// Tellib reaalajas uued sõnumid antud vestlusele (inquiry).
export function useRealtimeMessages(
  inquiryId: string,
  initial: Message[]
) {
  const [messages, setMessages] = useState<Message[]>(initial);

  // Lähtesta kui vahetub vestlus
  useEffect(() => {
    setMessages(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inquiryId]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${inquiryId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `inquiry_id=eq.${inquiryId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) =>
            prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [inquiryId]);

  return { messages, setMessages };
}
