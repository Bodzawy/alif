"use client";

import { useCallback, useRef, useState } from "react";

import type { StudentFeedback } from "@/lib/pronunciation/client";

// Shared state of an A1 step: only one exercise records at a time, and items
// answered correctly in this visit are marked. Nothing is stored or gated –
// A1 has no progression rules yet.
export function usePracticeSession() {
  const [active, setActive] = useState<string | null>(null);
  const [passed, setPassed] = useState<ReadonlySet<string>>(() => new Set());

  // Stable per-id handlers, so exercises do not re-run their effects on every render.
  const busyHandlers = useRef(new Map<string, (busy: boolean) => void>());
  const resultHandlers = useRef(new Map<string, (feedback: StudentFeedback) => void>());

  const busyHandler = useCallback((id: string) => {
    let handler = busyHandlers.current.get(id);
    if (!handler) {
      handler = (busy) => setActive((current) => (busy ? id : current === id ? null : current));
      busyHandlers.current.set(id, handler);
    }
    return handler;
  }, []);

  const resultHandler = useCallback((id: string) => {
    let handler = resultHandlers.current.get(id);
    if (!handler) {
      handler = (feedback) => {
        if (feedback.passed) setPassed((current) => (current.has(id) ? current : new Set(current).add(id)));
      };
      resultHandlers.current.set(id, handler);
    }
    return handler;
  }, []);

  return {
    passed,
    isLocked: (id: string) => active !== null && active !== id,
    busyHandler,
    resultHandler,
  };
}
