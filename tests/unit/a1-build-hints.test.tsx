import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { BuildActivity } from "@/components/a1/forms/build-activity";
import { getA1Lesson } from "@/data/a1";
import type { Narrator } from "@/lib/audio/narration";

// Review 11/2026: building الْحَفْلَة, the child put لَ where لْ belongs – "wrong", again and again, and it
// looked frozen: the tiles لْ and لَ differ only in their sign, and a tile dropped on a later field did
// nothing at all. Now both say why.

const hha = getA1Lesson("lesson-1", "hha")!.steps.find((s) => s.kind === "forms");
if (hha?.kind !== "forms") throw new Error("hha needs its Formen step");
const word = hha.forms.build.find((w) => w.arabic === "الْحَفْلَة")!;

const narrator = {
  play: async () => true,
  playClip: async () => "ended",
  playUrl: async () => "ended",
  unlock: () => {},
  stop: () => {},
  has: () => false,
} as unknown as Narrator;

const drop = (tile: string, slot: number) => {
  fireEvent.click(screen.getByTestId(`tile-${tile}`));
  fireEvent.click(screen.getByTestId(`slot-${slot}`));
};

afterEach(cleanup);

describe("Baue das Wort: الْحَفْلَة", () => {
  it("لَ for لْ: the letter is right, look at its sign; a later field: one after the other – and the word gets built", async () => {
    render(<BuildActivity words={[word]} narrator={narrator} onComplete={() => {}} letter={hha.forms.letter} />);
    expect(screen.queryByTestId("build-hint")).toBeNull();

    drop("ا", 0);
    expect(screen.getByTestId("slot-0")).toHaveAttribute("data-filled", "true");

    drop("لَ", 1);
    expect(screen.getByTestId("slot-1")).toHaveAttribute("data-filled", "false");
    expect(screen.getByTestId("build-hint")).toHaveAttribute("data-hint", "sign");

    drop("فْ", 3);
    expect(screen.getByTestId("slot-3")).toHaveAttribute("data-filled", "false");
    expect(screen.getByTestId("build-hint")).toHaveAttribute("data-hint", "order");

    drop("لْ", 1);
    expect(screen.getByTestId("slot-1")).toHaveAttribute("data-filled", "true");
    expect(screen.queryByTestId("build-hint")).toBeNull();

    for (const [tile, slot] of [["حَ", 2], ["فْ", 3], ["لَ", 4], ["ة", 5]] as const) drop(tile, slot);
    await waitFor(() => expect(screen.getByTestId(`build-word-${word.id}`)).toHaveAttribute("data-phase", "done"));
  });

  it("another letter: only the shake and the usual 'does not fit'", () => {
    render(<BuildActivity words={[word]} narrator={narrator} onComplete={() => {}} letter={hha.forms.letter} />);
    drop("حَ", 0);
    expect(screen.queryByTestId("build-hint")).toBeNull();
  });
});
