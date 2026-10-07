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
import { SoundsStep } from "@/components/a1/sounds-step";
import { buttonClasses } from "@/components/ui/button";
import { A1_LEVEL, a1LessonHref, a1StepHref, getA1Lesson } from "@/data/a1";
import type { A1Step } from "@/data/types";
import { lessonKey } from "@/lib/progress";
import { cn } from "@/lib/utils";

type Params = { lesson: string; step: string };

export function generateStaticParams(): Params[] {
  return A1_LEVEL.lessons.flatMap((lesson) => lesson.steps.map((step) => ({ lesson: lesson.slug, step: step.slug })));
}

function find(params: Params) {
  const lesson = getA1Lesson(params.lesson);
  const index = lesson?.steps.findIndex((step) => step.slug === params.step) ?? -1;
  return lesson && index >= 0 ? { lesson, step: lesson.steps[index]!, index } : undefined;
}

/** Recordings that exist under public/ (checked at build time, so missing files are never requested). */
function availableAudio(base: string): string[] {
  try {
    return readdirSync(path.join(process.cwd(), "public", base))
      .filter((file) => file.endsWith(".wav"))
      .map((file) => file.slice(0, -".wav".length));
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
  return found ? { title: `${A1_LEVEL.code} · Lektion ${found.lesson.number}: ${found.lesson.titleGerman} · Schritt ${found.index + 1}` } : {};
}

export default async function A1StepPage({ params }: { params: Promise<Params> }) {
  const found = find(await params);
  if (!found) notFound();
  const { lesson, step, index } = found;
  const previous = lesson.steps[index - 1];
  const next = lesson.steps[index + 1];

  return (
    <div className={cn("container py-6 sm:py-10", step.kind === "sounds" ? "max-w-2xl" : step.kind === "forms" || step.kind === "gaps" ? "max-w-3xl" : step.kind === "writing" ? "max-w-5xl" : "max-w-7xl")}>
      <nav aria-label="Brotkrumen" className="mb-4 flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <Link href={`/${A1_LEVEL.slug}`} className="inline-flex items-center gap-1 rounded-md hover:text-foreground focus-ring" data-testid="back-to-a1">
          <ArrowLeft className="h-4 w-4" aria-hidden /> {A1_LEVEL.code}
        </Link>
        <span data-testid="step-position">
          Schritt {index + 1} von {lesson.steps.length}
        </span>
      </nav>

      <header className="mb-6 text-center">
        <p className="text-sm font-semibold text-muted-foreground">
          {A1_LEVEL.code} · Lektion {lesson.number} · {lesson.titleGerman}
        </p>
        <h1 lang="ar" dir="rtl" className="mt-2 font-arabic text-4xl font-bold leading-[1.9] text-primary sm:text-5xl" data-testid="lesson-title">
          {lesson.title}
        </h1>
        <ol className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Schritte">
          {lesson.steps.map((item, i) => (
            <li key={item.slug}>
              <Link
                href={a1StepHref(lesson, item.slug)}
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

      {step.kind === "sounds" ? (
        <SoundsStep sounds={step.sounds} nextHref={next && a1StepHref(lesson, next.slug)} nextLabel={next ? `Weiter: ${next.title}` : ""} />
      ) : step.kind === "sound-words" ? (
        <GuidedSoundWords groups={step.groups} progressKey={lessonKey(a1LessonHref(lesson).slice(1), step.slug)} />
      ) : step.kind === "forms" ? (
        <FormsStep forms={step.forms} availableAudio={availableAudio(step.forms.audioBase)} progressKey={lessonKey(a1LessonHref(lesson).slice(1), step.slug)} />
      ) : step.kind === "writing" ? (
        <WritingStep letterSet={step.letterSet} progressKey={lessonKey(a1LessonHref(lesson).slice(1), step.slug)} />
      ) : (
        <GapsStep gaps={step.gaps} availableAudio={availableAudio(step.gaps.audioBase)} progressKey={lessonKey(a1LessonHref(lesson).slice(1), step.slug)} />
      )}

      {step.kind !== "sounds" && (
        <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {previous ? (
            <Link href={a1StepHref(lesson, previous.slug)} className={buttonClasses({ variant: "secondary", size: "lg" })} data-testid="step-prev">
              <ArrowLeft className="h-5 w-5" aria-hidden /> Zurück: {navLabel(previous)}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={a1StepHref(lesson, next.slug)} className={buttonClasses({ size: "lg" })} data-testid="step-next">
              Weiter: {navLabel(next)} <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          ) : (
            <Link href={`/${A1_LEVEL.slug}`} className={buttonClasses({ size: "lg" })} data-testid="back-to-lessons">
              Zurück zu {A1_LEVEL.code} <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
