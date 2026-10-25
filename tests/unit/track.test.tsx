import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { TrackDialog, TrackSwitch } from "@/components/track/track-switch";
import { getLessonProgress, markExercisePassed, subscribeProgress } from "@/lib/progress";
import { chooseTrack, currentTrack, readTrack } from "@/lib/track";

// ALIF Speaking (Beginner) and ALIF Pronunciation (Advanced): the choice, its
// own progress per programme, and the dialog in the header.

beforeAll(() => {
  // jsdom has no modal dialogs.
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
beforeEach(() => window.localStorage.clear());
afterEach(cleanup);

describe("track", () => {
  it("none before the first choice (ALIF Pronunciation applies), then the chosen one", () => {
    expect([readTrack(), currentTrack()]).toEqual([null, "pronunciation"]);
    chooseTrack("speaking");
    expect([readTrack(), currentTrack()]).toEqual(["speaking", "speaking"]);
    expect(window.localStorage.getItem("alif:track")).toBe("speaking");
  });

  it("each programme has its own progress; ALIF Pronunciation keeps the progress from before", () => {
    window.localStorage.setItem("alif:progress:v1", JSON.stringify({ "a0/alphabet": { passed: ["alif"] } }));
    let calls = 0;
    const unsubscribe = subscribeProgress(() => (calls += 1));
    expect(getLessonProgress("a0/alphabet").passed).toEqual(["alif"]);

    chooseTrack("speaking");
    expect(calls).toBe(1); // the pages re-read the progress
    expect(getLessonProgress("a0/alphabet").passed).toEqual([]);
    markExercisePassed("a0/alphabet", "baa");
    expect(getLessonProgress("a0/alphabet").passed).toEqual(["baa"]);
    expect(JSON.parse(window.localStorage.getItem("alif:progress:speaking:v1")!)).toEqual({ "a0/alphabet": { passed: ["baa"] } });

    chooseTrack("pronunciation");
    expect(getLessonProgress("a0/alphabet").passed).toEqual(["alif"]);
    unsubscribe();
  });
});

describe("the programme dialog", () => {
  const dialog = () => screen.getByTestId("track-dialog");

  it("opens by itself before the first choice and cannot be closed without choosing", async () => {
    render(
      <>
        <TrackSwitch />
        <TrackDialog />
      </>
    );
    await act(async () => undefined);
    expect(dialog()).toHaveAttribute("open");
    expect(dialog()).toHaveTextContent("ALIF Speaking – Beginner");
    expect(dialog()).toHaveTextContent("التحدّث باللغة العربية – مستوى مبتدئ");
    expect(dialog()).toHaveTextContent("ALIF Pronunciation – Advanced");
    expect(dialog()).toHaveTextContent("النطق الفصيح للعربية القرآنية – مستوى متقدم");
    expect(screen.queryByTestId("track-close")).toBeNull();
    const esc = new Event("cancel", { cancelable: true });
    dialog().dispatchEvent(esc);
    expect(esc.defaultPrevented).toBe(true);

    fireEvent.click(screen.getByTestId("track-option-speaking"));
    expect(dialog()).not.toHaveAttribute("open");
    expect(readTrack()).toBe("speaking");
    expect(screen.getByTestId("track-switch")).toHaveAttribute("data-track", "speaking");
    expect(screen.getByTestId("track-switch")).toHaveTextContent("Beginner");
  });

  it("stays closed once chosen; the header switch opens it to change the programme", async () => {
    chooseTrack("pronunciation");
    render(
      <>
        <TrackSwitch />
        <TrackSwitch />
        <TrackDialog />
      </>
    );
    await act(async () => undefined);
    expect(dialog()).not.toHaveAttribute("open");
    expect(screen.getAllByTestId("track-switch")[0]).toHaveTextContent("Advanced");

    fireEvent.click(screen.getAllByTestId("track-switch")[1]!);
    expect(dialog()).toHaveAttribute("open");
    expect(screen.getByTestId("track-option-pronunciation")).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByTestId("track-close"));
    expect(dialog()).not.toHaveAttribute("open");

    fireEvent.click(screen.getAllByTestId("track-switch")[0]!);
    fireEvent.click(screen.getByTestId("track-option-speaking"));
    expect(readTrack()).toBe("speaking");
    expect(screen.getAllByTestId("track-switch")[1]).toHaveTextContent("Beginner");
  });
});
