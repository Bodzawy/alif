import { CheckCircle2 } from "lucide-react";

import { PronunciationExercise } from "@/components/pronunciation/pronunciation-exercise";
import type { SoundItem } from "@/data/types";
import type { StudentFeedback } from "@/lib/pronunciation/client";
import { cn } from "@/lib/utils";

/**
 * A vocalised sound (e.g. أَ): big glyph, vowel name, listen and speak.
 *   lg   – step 1, the sound on its own;
 *   side – step 2, the sound at the start (right) of its word row, like the
 *          lesson sheet; on small screens a compact strip above the words.
 */
export function SoundCard({
  sound,
  size = "lg",
  passed,
  locked,
  onBusyChange,
  onResult,
  className,
  hideControls = false,
}: {
  sound: SoundItem;
  size?: "lg" | "side";
  passed: boolean;
  locked: boolean;
  onBusyChange: (busy: boolean) => void;
  onResult: (feedback: StudentFeedback) => void;
  className?: string;
  /** Guided mode (Schritt 2): no listen / record buttons – the page plays and records by itself. */
  hideControls?: boolean;
}) {
  const side = size === "side";
  return (
    <article
      data-testid={`sound-card-${sound.id}`}
      dir="rtl"
      className={cn(
        "relative flex rounded-3xl border text-center shadow-card",
        side
          ? "flex-col items-center gap-2 bg-primary-soft p-4 sm:flex-row sm:gap-4 xl:h-full xl:flex-col xl:justify-center xl:gap-2 xl:p-5"
          : "flex-col items-center bg-card p-6 sm:p-10",
        passed && "border-success/40",
        className
      )}
    >
      {passed && (
        <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Geschafft
        </span>
      )}
      <div className={cn("flex flex-col items-center", side && "shrink-0")}>
        <p
          lang="ar"
          data-testid={`sound-glyph-${sound.id}`}
          className={cn(
            "select-none font-arabic font-bold text-primary",
            side ? "text-7xl leading-[1.75] xl:text-[7rem]" : "text-[8rem] leading-[1.45] sm:text-[10rem]"
          )}
        >
          {sound.glyph}
        </p>
        <p dir="ltr" className={cn("text-sm text-muted-foreground", side && "-mt-2")}>
          <span lang="ar" dir="rtl" className="font-arabic text-base text-foreground">{sound.vowelName.arabic}</span> · {sound.vowelName.german} ·{" "}
          <span className="font-semibold italic text-foreground">{sound.transliteration}</span>
        </p>
      </div>
      {/* Buttons and German feedback read left to right. */}
      {!hideControls && (
        <div
          dir="ltr"
          className={cn(
            "w-full [&_svg]:shrink-0",
            // In the narrow column of a word row, listen and speak stand one above the other.
            side ? "min-w-0 flex-1 xl:mt-4 xl:flex-none xl:[&_.grid-cols-2]:grid-cols-1" : "mt-6 max-w-sm"
          )}
        >
          <PronunciationExercise exercise={sound.exercise} locked={locked} onBusyChange={onBusyChange} onResult={onResult} simpleFeedback />
        </div>
      )}
    </article>
  );
}
