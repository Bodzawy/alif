import type { Verdict } from "./writing-check";

// The teacher behind "Prüfen": /api/check-writing (Claude reads the answer). When it is not set up or not
// reachable, the local form check stands – and says plainly that it cannot tell whether the content is right.

export type AiPayload = { task?: string; sentence?: string; answer: string; model?: string; note?: string };

export const FORM_ONLY = "Die Form ist in Ordnung (arabische Schrift, Wörter aus der Lektion). Ob die Antwort inhaltlich stimmt, kann ich hier nicht prüfen – vergleiche mit dem Beispiel.";

async function askTeacher(payload: AiPayload): Promise<{ level: "ok" | "wrong"; message: string } | null> {
  try {
    const response = await fetch("/api/check-writing", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    if (!response.ok) return null;
    const data = (await response.json()) as { level?: unknown; message?: unknown };
    return (data.level === "ok" || data.level === "wrong") && typeof data.message === "string" ? { level: data.level, message: data.message } : null;
  } catch {
    return null;
  }
}

/** The local check first (empty, not Arabic …); what passes it goes to the teacher. */
export async function finalVerdict(local: Verdict, payload: AiPayload): Promise<Verdict> {
  if (local.level === "wrong") return local;
  const teacher = await askTeacher(payload);
  if (teacher) return { level: teacher.level, messages: [teacher.message] };
  return local.level === "ok" ? { level: "hint", messages: [FORM_ONLY] } : local;
}
