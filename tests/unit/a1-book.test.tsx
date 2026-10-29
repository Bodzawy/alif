import { cleanup, render, screen } from "@testing-library/react";
import { existsSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

// Every A1 lesson made from the book "لغتنا الفصحى 1" (Lektion 5 on, see
// docs/book-progress.md): structural checks that hold for every step, whatever
// its kind – it renders with the book's instruction, every picture exists,
// every evaluated text has a rule and may be spoken, every gap / tile / quiz /
// order / match task is solvable. The book's content itself is checked per
// unit (a1-unit-3.test.tsx …). MOCKED: /api/tts (speakArabic).

vi.mock("@/lib/tts/player", () => ({
  speakArabic: vi.fn(async () => undefined), speakLocal: vi.fn(async () => undefined),
  speechUrl: vi.fn(async (text: string) => `blob:${text}`),
  stopSpeaking: vi.fn(),
}));

import A1StepPage from "@/app/a1/[unit]/[lesson]/[step]/page";
import { A1_LEVEL, a1LessonExercises, a1SpokenTexts } from "@/data/a1";
import type { A1Step } from "@/data/types";
import { clozeLineText } from "@/lib/arabic/cloze";
import { alignPattern, gapTask } from "@/lib/arabic/gap";
import { CONDITION_RULES } from "@/lib/pronunciation/rules";
import { isAllowedTarget, isAllowedTtsText } from "@/lib/pronunciation/targets";

import { A1_UNIT_SLUGS } from "../support/a1-units";

const PUBLIC = path.join(process.cwd(), "public");
const bookUnits = A1_LEVEL.units.filter((unit) => unit.number >= 5);
const steps = bookUnits.flatMap((unit) => unit.lessons.flatMap((lesson) => lesson.steps.map((step) => [`${unit.slug}/${lesson.slug}/${step.slug}`, unit.slug, lesson.slug, step] as const)));
const exists = (src: string) => existsSync(path.join(PUBLIC, src));

afterEach(cleanup);

describe("the book's lessons", () => {
  it("are numbered on from Lektion 5, each a presentation (تقديم) of a book unit with its label", () => {
    expect(A1_LEVEL.units.map((unit) => unit.slug)).toEqual(A1_UNIT_SLUGS);
    bookUnits.forEach((unit, i) => {
      expect(unit.number).toBe(5 + i);
      expect(unit.bookLabel).toMatch(/^الْوَحْدَةُ .+ – تَقْدِيمٌ \([١٢]\)$/);
      expect(unit.lessons.length).toBeGreaterThan(0);
      for (const lesson of unit.lessons) {
        expect(lesson.steps.map((s) => s.slug)).toEqual(lesson.steps.map((_, n) => `step-${n + 1}`));
        expect(lesson.labelGerman).toBeTruthy();
      }
    });
  });

  it("every evaluated word and line has a rule, is an allowed target and may be spoken; every other spoken text is allowed", () => {
    for (const unit of bookUnits)
      for (const lesson of unit.lessons)
        for (const exercise of a1LessonExercises(lesson)) {
          expect(CONDITION_RULES[exercise.target], `${lesson.slug}: ${exercise.target}`).toBeDefined();
          expect(isAllowedTarget(exercise.target), exercise.target).toBe(true);
          expect(isAllowedTtsText(exercise.modelText), exercise.modelText).toBe(true);
        }
    for (const text of a1SpokenTexts()) expect(isAllowedTtsText(text), text).toBe(true);
  });
});

describe.each(steps)("%s", (_, unit, lesson, step) => {
  it("has the book's instruction (Arabic and German) and renders", async () => {
    expect(step.instruction?.german).toBeTruthy();
    expect(step.instruction?.arabic).toBeTruthy();
    render(await A1StepPage({ params: Promise.resolve({ unit, lesson, step: step.slug }) }));
    expect(screen.getByTestId("step-instruction-german")).toBeInTheDocument();
  });

  it("is solvable: pictures exist, every answer is offered", () => {
    checkStep(step);
  });
});

function checkStep(step: A1Step) {
  switch (step.kind) {
    case "sound-words":
    case "words":
      for (const group of step.groups)
        for (const word of group.words) {
          expect(word.transliteration, word.arabic).toMatch(/^[\p{Script=Latin}ʾʿ?.,'() -]+$/u);
          if (word.image) expect(exists(word.image.src), word.image.src).toBe(true);
        }
      return;
    case "gaps":
      for (const item of step.gaps.items) {
        if (item.image) expect(exists(item.image.src), item.image.src).toBe(true);
        const task = gapTask(item);
        expect(task.gaps.length, item.id).toBeGreaterThan(0);
        // More slots do not fit on a phone (390 px) – the book splits longer names into groups.
        expect(task.gaps.length, `${item.id}: ${item.arabic}`).toBeLessThanOrEqual(7);
        const gaps = alignPattern(item.arabic, item.pattern ?? "", item.bare);
        gaps.forEach((gap, n) => {
          const offered = item.gapChoices?.[n] ?? item.choices ?? step.gaps.choices;
          expect(offered, `${item.id}: ${gap.answer}`).toContain(gap.answer);
        });
      }
      return;
    case "dialogue":
      for (const speaker of step.dialogue.speakers) expect(exists(speaker.avatar.src), speaker.avatar.src).toBe(true);
      for (const line of step.dialogue.lines) expect(step.dialogue.speakers.map((s) => s.id), line.id).toContain(line.speaker);
      if (step.dialogue.question) expect(step.dialogue.question.options[step.dialogue.question.answer]).toBeDefined();
      return;
    case "cloze":
      for (const item of step.items) {
        if (item.image) expect(exists(item.image.src), item.image.src).toBe(true);
        for (const line of item.lines) {
          for (const part of line.parts)
            if (typeof part !== "string") {
              expect(part.options.some((o) => part.accept.includes(o)), `${item.id}: ${part.accept[0]}`).toBe(true);
              expect(new Set(part.options).size, `${item.id}: duplicate option`).toBe(part.options.length);
            }
          expect(isAllowedTtsText(clozeLineText(line.parts)), clozeLineText(line.parts)).toBe(true);
        }
      }
      return;
    case "quiz":
      for (const item of step.items) {
        if (item.image) expect(exists(item.image.src), item.image.src).toBe(true);
        for (const q of item.questions) {
          expect(q.options[q.answer], `${item.id}: ${q.prompt}`).toBeDefined();
          for (const option of q.options.filter((o) => o.startsWith("/images/"))) expect(exists(option), option).toBe(true);
        }
      }
      return;
    case "table":
      for (const q of step.quiz) expect(q.options[q.answer], q.id).toBeDefined();
      return;
    case "order": {
      const ids = step.order.items.map((item) => item.id).sort();
      for (const solution of step.order.solutions) expect([...solution].sort()).toEqual(ids);
      return;
    }
    case "match":
      for (const prompt of step.match.prompts) expect(step.match.options.map((o) => o.id)).toContain(prompt.answer);
      return;
    case "phrases":
      for (const group of step.groups) for (const item of group.items) expect(item.transliteration, item.arabic).toBeTruthy();
      return;
    default:
      return;
  }
}
