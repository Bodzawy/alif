import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { LessonCard } from "@/components/lessons/lesson-card";
import { A0_LEVEL, WORDS_LEVEL, lessonEntryHref, lessonExercises } from "@/data/curriculum";

export const metadata: Metadata = {
  title: `${WORDS_LEVEL.code} – ${WORDS_LEVEL.title}`,
  description: WORDS_LEVEL.description,
};

// A0 → Wörter: the vocabulary lessons (formerly A1).
export default function WordsPage() {
  const level = WORDS_LEVEL;

  return (
    <div className="container max-w-4xl py-8 sm:py-12">
      <Link href={`/${A0_LEVEL.slug}`} className="mb-6 inline-flex items-center gap-1 rounded-md text-sm text-muted-foreground hover:text-foreground focus-ring" data-testid="back-to-a0">
        <ArrowLeft className="h-4 w-4" aria-hidden /> {A0_LEVEL.code}
      </Link>

      <header className="flex items-center gap-4">
        <span className="rounded-2xl bg-primary px-4 py-3 text-3xl font-bold text-primary-foreground">{A0_LEVEL.code}</span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{level.title}</h1>
          <p className="mt-1 text-muted-foreground">{level.description}</p>
        </div>
      </header>

      <ol className="mt-8 space-y-4" aria-label="Lektionen">
        {level.lessons.map((lesson, index) => (
          <li key={lesson.slug}>
            <LessonCard
              levelSlug={level.slug}
              lesson={{
                slug: lesson.slug,
                number: lesson.number,
                title: lesson.title,
                subtitle: lesson.subtitle,
                minutes: lesson.minutes,
                letter: lesson.letter,
              }}
              href={lessonEntryHref(level.slug, lesson)}
              total={lessonExercises(lesson).length}
              previousLessonSlug={level.lessons[index - 1]?.slug}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
