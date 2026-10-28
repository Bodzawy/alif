import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { splitAddressee } from "@/components/a1/dialogue/dialogue-bubble";
import { A1_LEVEL } from "@/data/a1";
import { a1Tahiyya } from "@/data/a1/tahiyya";
import type { Dialogue } from "@/data/types";
import dialogueManifest from "@/lib/tts/dialogue-manifest.json";

// The dialogue recordings (one Gemini voice per DialogueVoice, installed by
// scripts/audio/install_dialogue_clips.py): a line plays its recording only in
// the voice and with the text it was made for.

const lines: Record<string, { voice: string; text: string; file: string }> = dialogueManifest.lines;

/** Every dialogue of A1, wherever a step keeps it. */
function dialogues(): Dialogue[] {
  const found = new Map<string, Dialogue>();
  const walk = (o: unknown) => {
    if (!o || typeof o !== "object") return;
    const d = o as Dialogue;
    if (Array.isArray(d.speakers) && Array.isArray(d.lines)) found.set(d.id, d);
    for (const v of Object.values(o)) walk(v);
  };
  walk(A1_LEVEL);
  return [...found.values()];
}

describe("dialogue recordings", () => {
  it("each recording belongs to a dialogue line (or an expression in a speaker's voice) of the app: the same voice, the same text", () => {
    const app = new Map<string, { voice: string; text: string }>();
    for (const d of dialogues())
      for (const line of d.lines) app.set(line.id, { voice: d.speakers.find((s) => s.id === line.speaker)!.voice, text: line.exercise.modelText });
    for (const step of a1Tahiyya.steps)
      if (step.kind === "phrases") for (const { id, exercise } of step.groups.flatMap((g) => g.items)) if (exercise.line === id) app.set(id, { voice: exercise.voice!, text: exercise.modelText });
    expect(Object.keys(lines).length).toBeGreaterThan(0);
    for (const [id, entry] of Object.entries(lines)) {
      expect(app.get(id), id).toEqual({ voice: entry.voice, text: entry.text });
      expect(entry.file).toMatch(/^d-[mf][12]-\d{2}\.[0-9a-f]{8}$/);
    }
  });

  it("Lektion 1: every line of its three dialogues is recorded; no dialogue is recorded only in part", () => {
    const all = dialogues();
    for (const id of ["ahmad-ali", "nabila-fatima", "majid-fatima"]) {
      const d = all.find((x) => x.id === id)!;
      for (const line of d.lines) expect(lines[line.id], `${id}/${line.id}`).toBeDefined();
    }
    for (const d of all) {
      const recorded = d.lines.filter((line) => lines[line.id]).length;
      expect([0, d.lines.length], d.id).toContain(recorded); // one speaker never switches between a recording and Azure
    }
  });

  describe("player", () => {
    const fetchMock = vi.fn();
    beforeEach(() => {
      vi.resetModules();
      fetchMock.mockReset();
      vi.stubGlobal("fetch", fetchMock);
      vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: vi.fn(() => "blob:test") }));
    });
    afterEach(() => vi.unstubAllGlobals());

    const { voice, text, file } = lines["m-sabah-al-khayr"]!;

    it("plays the line's recording in its voice", async () => {
      fetchMock.mockResolvedValue(new Response(new Blob(["x"]), { status: 200 }));
      const { speechUrl } = await import("@/lib/tts/player");
      await expect(speechUrl(text, voice as "male-1", "m-sabah-al-khayr")).resolves.toBe("blob:test");
      expect(fetchMock.mock.calls.map((c) => c[0])).toEqual([`/audio/ar/${file}.mp3`]);
    });

    it("asks /api/tts for another voice, another text, a line without recording – or when the file is missing", async () => {
      fetchMock.mockImplementation(async (url: string) => (url.startsWith("/audio/ar/") ? new Response("", { status: 404 }) : new Response(new Blob(["y"]), { status: 200 })));
      const { speechUrl } = await import("@/lib/tts/player");
      await speechUrl(text, "female-1", "m-sabah-al-khayr");
      await speechUrl("مَسَاءُ الْخَيْرِ.", "male-1", "m-sabah-al-khayr");
      await speechUrl(text, "male-1", "adnan-masa-al-khayr");
      await speechUrl(text, "male-1");
      expect(fetchMock.mock.calls.map((c) => c[0])).toEqual(["/api/tts", "/api/tts", "/api/tts", "/api/tts"]);
      await speechUrl(text, "male-1", "m-sabah-al-khayr");
      expect(fetchMock.mock.calls.slice(4).map((c) => c[0])).toEqual([`/audio/ar/${file}.mp3`, "/api/tts"]);
    });
  });
});

describe("expressions in a speaker's voice (Begrüßen und sich vorstellen)", () => {
  const items = a1Tahiyya.steps.flatMap((step) => (step.kind === "phrases" ? step.groups.flatMap((g) => g.items) : []));

  it("each plays the dialogue line it comes from – the same words, that speaker's voice and recording", () => {
    const app = new Map<string, { voice: string; text: string }>();
    for (const d of dialogues()) for (const line of d.lines) app.set(line.id, { voice: d.speakers.find((s) => s.id === line.speaker)!.voice, text: line.exercise.modelText });
    const bare = (t: string) => t.replace(/[.،؟!]/g, "").trim();
    expect(items.length).toBe(7);
    for (const { id, arabic, exercise } of items) {
      expect(exercise.voice, id).toBeDefined();
      if (exercise.line === id) continue; // its own recording (أَنَا مَاجِدٌ.: not recorded yet – Azure in Majid's voice)
      expect(app.get(exercise.line!), id).toEqual({ voice: exercise.voice, text: exercise.modelText });
      expect(bare(exercise.modelText), id).toBe(bare(arabic));
      expect(lines[exercise.line!], `${id}: recorded`).toEqual(expect.objectContaining({ voice: exercise.voice, text: exercise.modelText }));
    }
    // The masculine form is said by Fatima (to Majid), the feminine one by Majid (to Fatima).
    expect(items.find((i) => i.id === "p-kayfa-haluka")!.exercise.voice).toBe("female-2");
    expect(items.find((i) => i.id === "p-kayfa-haluki")!.exercise.voice).toBe("male-1");
  });
});

describe("whom a sentence is said to", () => {
  it("comes out of the German as a badge of its own", () => {
    expect(splitAddressee("Wie geht es dir? (zu einer Frau)")).toEqual({ german: "Wie geht es dir?", addressee: "zu einer Frau", gender: "f" });
    expect(splitAddressee("Ich heiße Majid. Und du? (zu einer Frau)")).toEqual({ german: "Ich heiße Majid. Und du?", addressee: "zu einer Frau", gender: "f" });
    expect(splitAddressee("Wie heißt du? (zu einem Mann)")).toEqual({ german: "Wie heißt du?", addressee: "zu einem Mann", gender: "m" });
    expect(splitAddressee("Wie geht es euch? (zu mehreren Frauen)").gender).toBe("f");
    expect(splitAddressee("Wie geht es euch? (zu zwei Männern)").gender).toBe("m");
    expect(splitAddressee("Gut, Gott sei Dank.")).toEqual({ german: "Gut, Gott sei Dank." });
    expect(splitAddressee("Wohnung (zu vermieten)")).toEqual({ german: "Wohnung (zu vermieten)" });
  });
});
