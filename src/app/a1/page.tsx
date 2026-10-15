import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { A1_LEVEL, a1UnitHref } from "@/data/a1";
import { arabicLessonLabel } from "@/data/a1/ordinals";

export const metadata: Metadata = {
  title: `${A1_LEVEL.code} – ${A1_LEVEL.title}`,
  description: A1_LEVEL.description,
};

// /a1: one card per lesson of the book. A lesson's letters, review and phrase
// are its contents (/a1/<lesson>), not lessons of their own.
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

      <ol className="mt-8 flex flex-col gap-4" aria-label="Lektionen">
        {A1_LEVEL.units.map((unit) => (
          <li key={unit.slug}>
            <Link
              href={a1UnitHref(unit)}
              data-testid={`a1-lesson-${unit.slug}`}
              className="group flex w-full flex-col items-stretch gap-2 rounded-2xl border bg-card p-4 shadow-card transition hover:shadow-lift focus-ring sm:flex-row sm:items-center sm:gap-5 sm:p-5"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-lg font-bold text-primary">{unit.number}</span>
                <ArrowRight className="h-6 w-6 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" aria-hidden />
              </div>
              <p lang="ar" dir="rtl" className="mt-5 text-right font-arabic text-xl text-muted-foreground">{unit.bookLabel ?? arabicLessonLabel(unit.number)}</p>
              <h2 lang="ar" dir="rtl" className="text-right font-arabic text-4xl font-bold leading-[1.6] text-primary">{unit.title}</h2>
              <p className="mt-2 font-semibold">
                Lektion {unit.number} · {unit.titleGerman}
              </p>
              <p lang="ar" dir="rtl" className="mt-3 text-right font-arabic text-2xl leading-[1.6] text-muted-foreground" data-testid={`a1-lesson-${unit.slug}-letters`}>
                {unit.lessons.filter((lesson) => lesson.letter).map((lesson) => lesson.label).join(" · ")}
              </p>
              <p className="mt-auto pt-4 text-sm font-medium text-primary">{unit.lessons.length} Teile</p>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
