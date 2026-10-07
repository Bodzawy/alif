import { notFound, redirect } from "next/navigation";

import { A1_LEVEL, a1StepHref, getA1Lesson } from "@/data/a1";
import { WORDS_LEVEL, getLesson, lessonHref } from "@/data/curriculum";

type Params = { lesson: string };

export function generateStaticParams(): Params[] {
  return A1_LEVEL.lessons.map((lesson) => ({ lesson: lesson.slug }));
}

// A lesson starts at its first step. URLs of the former A1 word lessons
// (/a1/lesson-N, now /a0/words/lesson-N) still lead there as long as A1 has no
// lesson with that slug.
export default async function A1LessonPage({ params }: { params: Promise<Params> }) {
  const { lesson: slug } = await params;
  const lesson = getA1Lesson(slug);
  if (lesson) redirect(a1StepHref(lesson, lesson.steps[0]!.slug));
  const moved = getLesson(WORDS_LEVEL.slug, slug);
  if (moved) redirect(lessonHref(WORDS_LEVEL.slug, moved.lesson));
  notFound();
}
