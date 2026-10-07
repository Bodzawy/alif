import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { LessonCard } from "@/components/lessons/lesson-card";
import { LessonGate } from "@/components/lessons/lesson-gate";
import { getLesson, lessonEntryHref } from "@/data/curriculum";
import { LESSONS_UNLOCK_IN_ORDER } from "@/data/lesson-unlock";
import { lessonKey, markLessonCompleted } from "@/lib/progress";

const lesson1 = getLesson("a0/words", "lesson-1")!.lesson;
const lesson2 = getLesson("a0/words", "lesson-2")!.lesson;
const lesson10 = getLesson("a0/words", "lesson-10")!.lesson;
const previous = { slug: lesson1.slug, number: 1, title: lesson1.title, href: lessonEntryHref("a0/words", lesson1) };

beforeEach(() => window.localStorage.clear());
afterEach(cleanup);

describe("lesson unlocking", () => {
  it("unlocks in order by default", () => {
    expect(LESSONS_UNLOCK_IN_ORDER).toBe(true);
  });

  it("locks a lesson (and its intro – same gate) until the previous lesson is completed", () => {
    render(
      <LessonGate levelSlug="a0/words" levelCode="A0 · Wörter" lessonNumber={2} previous={previous}>
        <p>Lektion 2 Inhalt</p>
      </LessonGate>
    );
    expect(screen.getByTestId("lesson-locked")).toHaveTextContent("Diese Lektion ist noch gesperrt.");
    expect(screen.getByRole("link", { name: "Zu Lektion 1" })).toHaveAttribute("href", "/a0/words/lesson-1/intro");
    expect(screen.queryByText("Lektion 2 Inhalt")).not.toBeInTheDocument();
  });

  it("opens the lesson once the previous one is completed", () => {
    markLessonCompleted(lessonKey("a0/words", "lesson-1"));
    render(
      <LessonGate levelSlug="a0/words" levelCode="A0 · Wörter" lessonNumber={2} previous={previous}>
        <p>Lektion 2 Inhalt</p>
      </LessonGate>
    );
    expect(screen.getByText("Lektion 2 Inhalt")).toBeInTheDocument();
  });

  it("never locks the first lesson", () => {
    render(
      <LessonGate levelSlug="a0/words" levelCode="A0 · Wörter" lessonNumber={1}>
        <p>Lektion 1 Inhalt</p>
      </LessonGate>
    );
    expect(screen.getByText("Lektion 1 Inhalt")).toBeInTheDocument();
  });

  it("shows a locked card without a link; once open it links to the intro video", () => {
    const { rerender } = render(
      <LessonCard levelSlug="a0/words" lesson={lesson2} href={lessonEntryHref("a0/words", lesson2)} total={4} previousLessonSlug="lesson-1" />
    );
    expect(screen.getByTestId("lesson-link-lesson-2")).toHaveAttribute("data-locked", "true");
    expect(screen.getByTestId("lesson-link-lesson-2")).toHaveTextContent("Gesperrt");

    markLessonCompleted(lessonKey("a0/words", "lesson-1"));
    rerender(<LessonCard levelSlug="a0/words" lesson={lesson2} href={lessonEntryHref("a0/words", lesson2)} total={4} previousLessonSlug="lesson-1" />);
    expect(screen.getByTestId("lesson-link-lesson-2")).toHaveAttribute("href", "/a0/words/lesson-2/intro");
  });

  it("links an open lesson without intro video straight to the lesson", () => {
    markLessonCompleted(lessonKey("a0/words", "lesson-9"));
    render(<LessonCard levelSlug="a0/words" lesson={lesson10} href={lessonEntryHref("a0/words", lesson10)} total={4} previousLessonSlug="lesson-9" />);
    expect(screen.getByTestId("lesson-link-lesson-10")).toHaveAttribute("href", "/a0/words/lesson-10");
  });
});
