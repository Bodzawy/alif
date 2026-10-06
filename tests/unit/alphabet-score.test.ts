import { describe, expect, it } from "vitest";

import { letterScore, roundScore, scoreRating } from "@/lib/alphabet-score";
import { createSpeechGate } from "@/lib/audio/voice-activity";

describe("A0 round score", () => {
  it("deducts 10 points per extra attempt and never goes below 0", () => {
    expect([1, 2, 3, 4, 10, 11, 25].map(letterScore)).toEqual([100, 90, 80, 70, 10, 0, 0]);
    expect(letterScore(null)).toBe(0);
  });

  it("averages the letters of a round (example: أ 1, ب 1, ت 2, ف 3 attempts → 92 %)", () => {
    const round = [
      { id: "alif", attempts: 1 },
      { id: "baa", attempts: 1 },
      { id: "taa", attempts: 2 },
      { id: "faa", attempts: 3 },
    ];
    expect(roundScore(round)).toBe(92);
    expect(roundScore(round.map((r) => ({ ...r, attempts: 1 })))).toBe(100);
    expect(roundScore([])).toBe(0);
  });

  it("only reaches 100 % when every letter was right on the first attempt", () => {
    const round = Array.from({ length: 28 }, (_, i) => ({ id: String(i), attempts: i === 0 ? 2 : 1 }));
    expect(roundScore(round)).toBe(99);
  });

  it("a skipped letter scores 0", () => {
    expect(roundScore([{ id: "alif", attempts: 1 }, { id: "baa", attempts: null }])).toBe(50);
  });

  it("rates the score", () => {
    expect(scoreRating(100).arabic).toBe("ممتاز جدًا");
    expect(scoreRating(95).arabic).toBe("ممتاز");
    expect(scoreRating(90).arabic).toBe("ممتاز");
    expect(scoreRating(85).arabic).toBe("جيد جدًا");
    expect(scoreRating(79).arabic).toBe("يحتاج إلى مزيد من التدريب");
  });
});

describe("speech gate", () => {
  const feed = (gate: ReturnType<typeof createSpeechGate>, level: number, from: number, to: number) => {
    const events: Array<[number, string]> = [];
    for (let t = from; t < to; t += 30) {
      const event = gate.update(level, t);
      if (event) events.push([t, event]);
    }
    return events;
  };

  it("detects a spoken letter and its end after a short silence", () => {
    const gate = createSpeechGate();
    expect(feed(gate, 0.002, 0, 600)).toEqual([]);
    const start = feed(gate, 0.2, 600, 1200);
    expect(start).toHaveLength(1);
    expect(start[0]![1]).toBe("speech-start");
    expect(start[0]![0]).toBeGreaterThanOrEqual(720);
    const end = feed(gate, 0.002, 1200, 2400);
    expect(end).toHaveLength(1);
    expect(end[0]![1]).toBe("speech-end");
    expect(end[0]![0]).toBeGreaterThanOrEqual(1870);
  });

  it("ignores clicks shorter than the minimum speech time", () => {
    const gate = createSpeechGate();
    feed(gate, 0.002, 0, 300);
    expect(feed(gate, 0.3, 300, 360)).toEqual([]);
    expect(feed(gate, 0.002, 360, 900)).toEqual([]);
    expect(gate.speaking).toBe(false);
  });

  it("adapts to steady background noise", () => {
    const gate = createSpeechGate();
    expect(feed(gate, 0.02, 0, 3000).filter(([, e]) => e === "speech-start")).toHaveLength(1);
    const quiet = createSpeechGate();
    // A noise floor that rises slowly is learned instead of being taken for speech.
    let events = 0;
    for (let t = 0; t < 6000; t += 30) if (quiet.update(0.001 + (t / 6000) * 0.012, t)) events++;
    expect(events).toBe(0);
  });
});
