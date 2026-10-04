import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LessonGate } from "@/components/lessons/lesson-gate";
import { LessonIntro } from "@/components/lessons/lesson-intro";
import { LEVELS, getLesson, lessonEntryHref, previousLesson } from "@/data/curriculum";

type Params = { level: string; lesson: string };

export function generateStaticParams(): Params[] {
  return LEVELS.flatMap((level) =>
    level.lessons.filter((lesson) => lesson.introVideo).map((lesson) => ({ level: level.slug, lesson: lesson.slug }))
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { level: levelSlug, lesson: lessonSlug } = await params;
  const found = getLesson(levelSlug, lessonSlug);
  return found?.lesson.introVideo
    ? { title: `${found.level.code} · Lektion ${found.lesson.number}: Einführung`, description: found.lesson.subtitle }
    : {};
}

export default async function LessonIntroPage({ params }: { params: Promise<Params> }) {
  const { level: levelSlug, lesson: lessonSlug } = await params;
  const found = getLesson(levelSlug, lessonSlug);
  if (!found?.lesson.introVideo) notFound();

  const previous = previousLesson(levelSlug, lessonSlug);

  return (
    <LessonGate
      levelSlug={found.level.slug}
      levelCode={found.level.code}
      lessonNumber={found.lesson.number}
      previous={previous && { slug: previous.slug, number: previous.number, title: previous.title, href: lessonEntryHref(found.level.slug, previous) }}
    >
      <LessonIntro levelSlug={found.level.slug} levelCode={found.level.code} lesson={found.lesson} video={found.lesson.introVideo} />
    </LessonGate>
  );
}
