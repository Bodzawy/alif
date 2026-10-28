import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, AudioLines, BookOpenCheck, MessageCircle } from "lucide-react";

import { A1_LEVEL, a1Entries, a1LessonHref, getA1Unit } from "@/data/a1";
import { arabicLessonLabel } from "@/data/a1/ordinals";
import { WORDS_LEVEL, getLesson, lessonHref } from "@/data/curriculum";
import { T } from "@/i18n/use-locale";

type Params = { unit: string };

export function generateStaticParams(): Params[] {
  return A1_LEVEL.units.map((unit) => ({ unit: unit.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const unit = getA1Unit((await params).unit);
  return unit ? { title: `${A1_LEVEL.code} · Lektion ${unit.number}: ${unit.titleGerman}` } : {};
}

// The contents of an A1 lesson: its letters, the review and the phrase, in
// book order. Old URLs still lead somewhere: an entry's slug (/a1/ba) goes to
// that entry; the former A1 word lessons (/a1/lesson-N, now
// /a0/words/lesson-N) go there as long as A1 has no lesson with that slug.
export default async function A1UnitPage({ params }: { params: Promise<Params> }) {
  const { unit: slug } = await params;
  const unit = getA1Unit(slug);
  if (!unit) {
    const entry = a1Entries().find(({ lesson }) => lesson.slug === slug);
    if (entry) redirect(a1LessonHref(entry.unit, entry.lesson));
    const moved = getLesson(WORDS_LEVEL.slug, slug);
    if (moved) redirect(lessonHref(WORDS_LEVEL.slug, moved.lesson));
    notFound();
  }

  return (
    <div className="container max-w-4xl py-8 sm:py-12">
      <Link href={`/${A1_LEVEL.slug}`} className="mb-6 inline-flex items-center gap-1 rounded-md text-sm text-muted-foreground hover:text-foreground focus-ring" data-testid="back-to-a1">
        <ArrowLeft className="h-4 w-4" aria-hidden /> {A1_LEVEL.code}
      </Link>

      <header className="text-center">
        <p className="text-sm font-semibold text-muted-foreground">
          {A1_LEVEL.code} · <T params={{ n: unit.number }}>{"Lektion {n}"}</T> · <T>{unit.titleGerman}</T>
        </p>
        <p lang="ar" dir="rtl" className="mt-3 font-arabic text-2xl text-muted-foreground">{unit.bookLabel ?? arabicLessonLabel(unit.number)}</p>
        <h1 lang="ar" dir="rtl" className="font-arabic text-5xl font-bold leading-[1.8] text-primary" data-testid="unit-title">
          {unit.title}
        </h1>
      </header>

      <ol dir="rtl" className="mt-8 flex flex-col gap-3" aria-label="Inhalt der Lektion" data-testid="unit-contents">
        {unit.lessons.map((lesson, i) => (
          <li key={lesson.slug} className="w-full">
            <Link
              href={a1LessonHref(unit, lesson)}
              data-testid={`unit-entry-${lesson.slug}`}
              data-kind={lesson.kind}
              className="group flex w-full flex-row items-center justify-between gap-4 rounded-2xl border bg-card p-4 text-right shadow-card transition hover:shadow-lift focus-ring"
            >
              <span dir="ltr" className="self-start text-xs font-semibold text-muted-foreground">
                {i + 1}
              </span>
              {lesson.kind === "review" ? (
                <BookOpenCheck className="h-8 w-8 text-primary" aria-hidden />
              ) : lesson.kind === "phrase" ? (
                <MessageCircle className="h-8 w-8 text-primary" aria-hidden />
              ) : lesson.kind === "topic" ? (
                <AudioLines className="h-8 w-8 text-primary" aria-hidden />
              ) : null}
              <span lang="ar" className={lesson.kind === "letter" ? "font-arabic text-6xl font-bold leading-[1.6] text-primary" : "font-arabic text-3xl font-bold leading-[1.8] text-primary"} data-testid={`unit-entry-${lesson.slug}-label`}>
                {lesson.label}
              </span>
              <span dir="ltr" className="font-semibold">
                <T>{lesson.labelGerman}</T>
              </span>
              <span dir="ltr" className="inline-flex items-center gap-1 text-sm text-muted-foreground group-hover:text-primary">
                <T params={{ n: lesson.steps.length }}>{"{n} Schritte"}</T> <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
