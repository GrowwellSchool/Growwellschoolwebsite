"use client";

import { useEffect, useState } from "react";

export interface MessageState {
  type: "success" | "error";
  text: string;
}

export function useAutoMessage() {
  const [message, setMessage] = useState<MessageState | null>(null);

  useEffect(() => {
    if (message?.type === "success") {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return [message, setMessage] as const;
}
