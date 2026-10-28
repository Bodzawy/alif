import type { ReactNode } from "react";

import type { DialogueLine, DialogueSpeaker } from "@/data/types";
import { cn } from "@/lib/utils";

// One line of a dialogue as a chat bubble: the speaker's picture and name,
// then the Arabic (RTL), the transliteration and the German meaning (LTR).
// The first speaker stands on the right (Arabic reading direction), the
// second on the left; each has their own colour.

export type BubbleState = "idle" | "playing" | "active" | "done" | "waiting";

/** "Wie geht es dir? (zu einem Mann)" → the meaning and whom it is said to – shown as a badge of its own. */
const ADDRESSEE = /\s*\((zu (?:einem Mann|einer Frau|zwei Männern|zwei Frauen|mehreren Männern|mehreren Frauen))\)\s*$/;

export function splitAddressee(german: string): { german: string; addressee?: string; gender?: "m" | "f" } {
  const match = ADDRESSEE.exec(german);
  if (!match) return { german };
  return { german: german.slice(0, match.index), addressee: match[1], gender: /Frau/.test(match[1]!) ? "f" : "m" };
}

/** Whom a sentence is said to – large and coloured, so the masculine / feminine form is not missed. */
export function AddresseeBadge({ addressee, gender, testId }: { addressee: string; gender?: "m" | "f"; testId?: string }) {
  return (
    <span
      dir="ltr"
      data-testid={testId}
      data-gender={gender}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-sm font-bold sm:text-base",
        gender === "f" ? "border-accent/60 bg-accent-soft text-accent-foreground" : gender === "m" ? "border-primary/50 bg-primary-soft text-primary" : "border-border bg-muted text-foreground"
      )}
    >
      {gender && (
        <span aria-hidden className="text-base sm:text-lg">
          {gender === "f" ? "♀" : "♂"}
        </span>
      )}
      {addressee}
    </span>
  );
}

export function DialogueBubble({
  line,
  speaker,
  first,
  showTransliteration,
  showGerman,
  state = "idle",
  label,
  actions,
  children,
  itemRef,
}: {
  line: DialogueLine;
  speaker: DialogueSpeaker;
  /** The dialogue's first speaker (right side). */
  first: boolean;
  showTransliteration: boolean;
  showGerman: boolean;
  state?: BubbleState;
  /** Shown instead of the speaker's name, e.g. "Du (Samir)". */
  label?: string;
  actions?: ReactNode;
  children?: ReactNode;
  /** The list item, e.g. to scroll it into view. */
  itemRef?: (el: HTMLLIElement | null) => void;
}) {
  const { german, addressee, gender } = splitAddressee(line.german);
  return (
    <li
      ref={itemRef}
      dir="rtl"
      data-testid={`dialogue-line-${line.id}`}
      data-speaker={speaker.id}
      data-state={state}
      className={cn("flex items-end gap-3 transition-opacity duration-300", first ? "flex-row" : "flex-row-reverse", state === "waiting" && "opacity-50")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local SVG avatar */}
      <img src={speaker.avatar.src} alt={speaker.avatar.alt} width={56} height={56} className="h-12 w-12 shrink-0 rounded-full border bg-card shadow-sm sm:h-14 sm:w-14" data-testid={`avatar-${speaker.id}`} />
      <div
        className={cn(
          "relative min-w-0 max-w-[85%] rounded-3xl border px-4 py-3 shadow-card transition sm:max-w-[75%] sm:px-5",
          first ? "rounded-br-md bg-primary-soft" : "rounded-bl-md bg-accent-soft",
          state === "playing" && "ring-2 ring-primary",
          state === "active" && "ring-2 ring-primary shadow-lift",
          state === "done" && "border-success/40"
        )}
      >
        <p dir="ltr" className={cn("mb-2 text-xs font-semibold", first ? "text-right text-primary" : "text-left text-accent-foreground")} data-testid={`speaker-name-${line.id}`}>
          {label ?? speaker.name}
        </p>
        <p lang="ar" dir="rtl" className="pt-1 font-arabic text-3xl font-bold leading-[1.9] text-foreground sm:text-4xl" data-testid={`line-arabic-${line.id}`}>
          {line.arabic}
        </p>
        {showTransliteration && (
          <p dir="ltr" className="text-left text-sm font-medium italic text-muted-foreground" data-testid={`line-translit-${line.id}`}>
            {line.transliteration}
          </p>
        )}
        {addressee && (
          <p dir="ltr" className="mt-1 text-left">
            <AddresseeBadge addressee={addressee} gender={gender} testId={`line-addressee-${line.id}`} />
          </p>
        )}
        {showGerman && (
          <p dir="ltr" className="mt-1 text-left text-base font-semibold" data-testid={`line-german-${line.id}`}>
            {german}
            {line.literal && <span className="font-normal text-muted-foreground"> (wörtlich: {line.literal})</span>}
          </p>
        )}
        {actions && (
          <div dir="ltr" className="mt-2 flex flex-wrap gap-2">
            {actions}
          </div>
        )}
        {children}
      </div>
    </li>
  );
}

/** "Übersetzung" / "Umschrift" switches. */
export function DialogueToggles({
  showGerman,
  showTransliteration,
  onGerman,
  onTransliteration,
}: {
  showGerman: boolean;
  showTransliteration: boolean;
  onGerman: () => void;
  onTransliteration: () => void;
}) {
  const chip = (on: boolean) =>
    cn("min-h-11 rounded-full border px-4 text-sm font-medium transition focus-ring", on ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted");
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Anzeige">
      <button type="button" aria-pressed={showGerman} onClick={onGerman} className={chip(showGerman)} data-testid="toggle-german">
        {showGerman ? "Übersetzung ausblenden" : "Übersetzung anzeigen"}
      </button>
      <button type="button" aria-pressed={showTransliteration} onClick={onTransliteration} className={chip(showTransliteration)} data-testid="toggle-translit">
        {showTransliteration ? "Umschrift ausblenden" : "Umschrift anzeigen"}
      </button>
    </div>
  );
}
