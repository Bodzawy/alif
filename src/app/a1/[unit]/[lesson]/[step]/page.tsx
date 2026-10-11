import { readdirSync } from "node:fs";
import path from "node:path";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { FormsStep } from "@/components/a1/forms/forms-step";
import { GapsStep } from "@/components/a1/gaps/gaps-step";
import { WritingStep } from "@/components/a1/writing/writing-step";
import { GuidedSoundWords } from "@/components/a1/guided/guided-sound-words";
import { DialogueStep } from "@/components/a1/dialogue/dialogue-step";
import { buttonClasses } from "@/components/ui/button";
import { A1_LEVEL, a1Entries, a1LessonHref, a1StepHref, a1StepKey, a1UnitHref, getA1Unit } from "@/data/a1";
import type { A1Step } from "@/data/types";
import { cn } from "@/lib/utils";

type Params = { unit: string; lesson: string; step: string };

export function generateStaticParams(): Params[] {
  return a1Entries().flatMap(({ unit, lesson }) => lesson.steps.map((step) => ({ unit: unit.slug, lesson: lesson.slug, step: step.slug })));
}

function find(params: Params) {
  const unit = getA1Unit(params.unit);
  const at = unit?.lessons.findIndex((lesson) => lesson.slug === params.lesson) ?? -1;
  const lesson = unit?.lessons[at];
  const index = lesson?.steps.findIndex((step) => step.slug === params.step) ?? -1;
  return unit && lesson && index >= 0 ? { unit, lesson, nextLesson: unit.lessons[at + 1], step: lesson.steps[index]!, index } : undefined;
}

/**
 * Recordings that exist under public/ (checked at build time, so missing files
 * are never requested), as paths relative to `base` without ".wav" – e.g.
 * "g_ok", or "shared/g_ok" and "ba/uebungen/banat" for the base /audio/a1.
 */
function availableAudio(base: string): string[] {
  try {
    return readdirSync(path.join(process.cwd(), "public", base), { recursive: true, encoding: "utf8" })
      .filter((file) => file.endsWith(".wav"))
      .map((file) => file.split(path.sep).join("/").slice(0, -".wav".length));
  } catch {
    return [];
  }
}

const navLabel = (step: A1Step) => step.navLabel ?? step.title;

/** "Formen: أ · ـأ": on phones only "Formen" is shown (six pills fit on two lines); the full title stays in the text. */
function PillTitle({ title }: { title: string }) {
  const cut = title.indexOf(": ");
  if (cut < 0) return <>{title}</>;
  return (
    <span>
      {title.slice(0, cut)}
      <span className="hidden sm:inline">{title.slice(cut)}</span>
    </span>
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const found = find(await params);
  return found ? { title: `${A1_LEVEL.code} · Lektion ${found.unit.number}: ${found.unit.titleGerman} · ${found.lesson.labelGerman} · Schritt ${found.index + 1}` } : {};
}

export default async function A1StepPage({ params }: { params: Promise<Params> }) {
  const found = find(await params);
  if (!found) notFound();
  const { unit, lesson, nextLesson, step, index } = found;
  const progressKey = a1StepKey(unit, lesson, step.slug);
  const previous = lesson.steps[index - 1];
  const next = lesson.steps[index + 1];

  return (
    <div className={cn("container py-6 sm:py-10", step.kind === "dialogue" ? "max-w-3xl" : step.kind === "forms" || step.kind === "gaps" ? "max-w-3xl" : step.kind === "writing" ? "max-w-5xl" : "max-w-7xl")}>
      <nav aria-label="Brotkrumen" className="mb-4 flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <Link href={a1UnitHref(unit)} className="inline-flex items-center gap-1 rounded-md hover:text-foreground focus-ring" data-testid="back-to-unit">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Lektion {unit.number}
        </Link>
        <span data-testid="step-position">
          Schritt {index + 1} von {lesson.steps.length}
        </span>
      </nav>

      <header className="mb-6 text-center">
        <p className="text-sm font-semibold text-muted-foreground">
          {A1_LEVEL.code} · Lektion {unit.number} · {unit.titleGerman}
        </p>
        <h1 lang="ar" dir="rtl" className="mt-2 font-arabic text-4xl font-bold leading-[1.9] text-primary sm:text-5xl" data-testid="lesson-title">
          {unit.title}
        </h1>
        <p className="mt-1 inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-1 font-semibold text-primary" data-testid="entry-title">
          <span lang="ar" dir="rtl" className="font-arabic text-2xl leading-[1.6]">{lesson.label}</span> {lesson.labelGerman}
        </p>
        <ol className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Schritte">
          {lesson.steps.map((item, i) => (
            <li key={item.slug}>
              <Link
                href={a1StepHref(unit, lesson, item.slug)}
                aria-current={i === index ? "step" : undefined}
                data-testid={`step-tab-${item.slug}`}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition focus-ring",
                  i === index ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="font-bold">{i + 1}</span> <PillTitle title={item.title} />
              </Link>
            </li>
          ))}
        </ol>
      </header>

      {step.kind === "sound-words" ? (
        <GuidedSoundWords groups={step.groups} progressKey={progressKey} />
      ) : step.kind === "forms" ? (
        <FormsStep forms={step.forms} availableAudio={availableAudio(step.forms.audioBase)} progressKey={progressKey} />
      ) : step.kind === "writing" ? (
        <WritingStep letterSet={step.letterSet} progressKey={progressKey} />
      ) : step.kind === "dialogue" ? (
        <DialogueStep dialogue={step.dialogue} mode={step.mode} progressKey={progressKey} />
      ) : (
        <GapsStep gaps={step.gaps} availableAudio={availableAudio(step.gaps.audioBase)} progressKey={progressKey} />
      )}

      {(
        <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {previous ? (
            <Link href={a1StepHref(unit, lesson, previous.slug)} className={buttonClasses({ variant: "secondary", size: "lg" })} data-testid="step-prev">
              <ArrowLeft className="h-5 w-5" aria-hidden /> Zurück: {navLabel(previous)}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={a1StepHref(unit, lesson, next.slug)} className={buttonClasses({ size: "lg" })} data-testid="step-next">
              Weiter: {navLabel(next)} <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          ) : (
            // The last step: back to the lesson's contents, or on to its next entry.
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Link href={a1UnitHref(unit)} className={buttonClasses({ variant: "secondary", size: "lg" })} data-testid="back-to-unit-end">
                Zur Lektion {unit.number}
              </Link>
              {nextLesson && (
                <Link href={a1LessonHref(unit, nextLesson)} className={buttonClasses({ size: "lg" })} data-testid="next-entry">
                  Weiter: <span lang="ar" className="font-arabic text-xl leading-none">{nextLesson.label}</span> {nextLesson.labelGerman} <ArrowRight className="h-5 w-5" aria-hidden />
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
