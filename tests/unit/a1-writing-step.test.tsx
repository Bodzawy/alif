import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import A1StepPage from "@/app/a1/[lesson]/[step]/page";
import { getA1Lesson } from "@/data/a1";
import { alifWriting } from "@/data/letters/alif";

// jsdom has neither canvas drawing nor SVG geometry: the page must still render.
beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const lesson = getA1Lesson("lesson-1")!;

async function renderStep(step: string) {
  render(await A1StepPage({ params: Promise.resolve({ lesson: "lesson-1", step }) }));
}

describe("A1 · Lektion 1 · Schritt 4 Schreiben – registration and navigation", () => {
  it("is registered as step-4 of kind 'writing' with the Alif letter set", () => {
    const step = lesson.steps[3]!;
    expect(step).toMatchObject({ slug: "step-4", kind: "writing", title: "Schreiben: ا · ـا · أ · ـأ", navLabel: "Schreiben" });
    if (step.kind !== "writing") throw new Error();
    expect(step.letterSet).toBe(alifWriting);
    expect(alifWriting.forms.map((f) => [f.glyph, f.strokes.length])).toEqual([["ا", 1], ["ـا", 1], ["أ", 2], ["ـأ", 2]]);
    // The Hamza is stroke 2 and drawn thin.
    expect(alifWriting.forms.filter((f) => f.strokes.length === 2).every((f) => f.strokes[1]!.thin && !f.strokes[0]!.thin)).toBe(true);
  });

  it("shows four pills; Formen's last button leads to Schreiben", async () => {
    await renderStep("step-3");
    const pills = within(screen.getByRole("list", { name: "Schritte" })).getAllByRole("link");
    expect(pills.map((p) => p.textContent?.replace(/\s+/g, " ").trim())).toEqual([
      "1 Laute: أَ · إِ · أُ",
      "2 Wörter mit أَ · إِ · أُ",
      "3 Formen: أ · ـأ",
      "4 Schreiben: ا · ـا · أ · ـأ",
      "5 Ergänzen: أَ · إِ · أُ",
      "6 Hören: أْ · أَ · إِ · أُ",
    ]);
    expect(screen.getByTestId("step-position")).toHaveTextContent("Schritt 3 von 6");
    expect(screen.getByTestId("step-next")).toHaveTextContent("Weiter: Schreiben");
    expect(screen.getByTestId("step-next")).toHaveAttribute("href", "/a1/lesson-1/step-4");
  });

  it("Schreiben: Zurück: Formen on the left, Weiter: Ergänzen on the right, Schritt 4 von 6", async () => {
    await renderStep("step-4");
    expect(screen.getByTestId("step-position")).toHaveTextContent("Schritt 4 von 6");
    expect(screen.getByTestId("step-prev")).toHaveTextContent("Zurück: Formen");
    expect(screen.getByTestId("step-prev")).toHaveAttribute("href", "/a1/lesson-1/step-3");
    expect(screen.getByTestId("step-next")).toHaveTextContent("Weiter: Ergänzen");
    expect(screen.getByTestId("step-next")).toHaveAttribute("href", "/a1/lesson-1/step-5");
    expect(screen.getByTestId("writing-step")).toBeInTheDocument();
    expect(screen.getByTestId("step-tab-step-4")).toHaveAttribute("aria-current", "step");
  });
});
