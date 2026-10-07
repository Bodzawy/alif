import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { A1_LEVEL, a1StepHref } from "@/data/a1";
import { arabicLessonLabel } from "@/data/a1/ordinals";

export const metadata: Metadata = {
  title: `${A1_LEVEL.code} – ${A1_LEVEL.title}`,
  description: A1_LEVEL.description,
};

export default function A1Page() {
  return (
    <div className="container max-w-4xl py-8 sm:py-12">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 rounded-md text-sm text-muted-foreground hover:text-foreground focus-ring">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Startseite
      </Link>

      <header className="flex items-center gap-4">
        <span className="rounded-2xl bg-primary px-4 py-3 text-3xl font-bold text-primary-foreground">{A1_LEVEL.code}</span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{A1_LEVEL.title}</h1>
          <p className="mt-1 text-muted-foreground">{A1_LEVEL.description}</p>
        </div>
      </header>

      <ol className="mt-8 grid gap-5 sm:grid-cols-2" aria-label="Lektionen">
        {A1_LEVEL.lessons.map((lesson) => (
          <li key={lesson.slug}>
            <Link
              href={a1StepHref(lesson, lesson.steps[0]!.slug)}
              data-testid={`a1-lesson-${lesson.slug}`}
              className="group flex h-full flex-col rounded-3xl border bg-card p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift focus-ring"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-lg font-bold text-primary">{lesson.number}</span>
                <ArrowRight className="h-6 w-6 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" aria-hidden />
              </div>
              <p lang="ar" dir="rtl" className="mt-5 text-right font-arabic text-xl text-muted-foreground">{arabicLessonLabel(lesson.number)}</p>
              <h2 lang="ar" dir="rtl" className="text-right font-arabic text-4xl font-bold leading-[1.6] text-primary">{lesson.title}</h2>
              <p className="mt-2 font-semibold">
                Lektion {lesson.number} · {lesson.titleGerman}
              </p>
              <p className="mt-auto pt-4 text-sm font-medium text-primary">{lesson.steps.length} Schritte</p>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
