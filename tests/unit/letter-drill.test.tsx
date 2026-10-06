import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/audio/wav", () => ({
  blobTo16KhzMonoWav: vi.fn(async () => new Blob(["RIFFtest"], { type: "audio/wav" })),
}));
const tts = vi.hoisted(() => ({ speak: vi.fn(async (_text: string) => undefined), stop: vi.fn() }));
vi.mock("@/lib/tts/player", () => ({ speakArabic: tts.speak, stopSpeaking: tts.stop }));
// Voice activity: the test decides when the "student" starts and stops speaking.
const voice = vi.hoisted(() => ({ emit: null as null | ((e: "speech-start" | "speech-end") => void), stop: vi.fn() }));
vi.mock("@/lib/audio/voice-activity", async (original) => ({
  ...(await original<typeof import("@/lib/audio/voice-activity")>()),
  watchVoiceActivity: vi.fn(async (_stream: MediaStream, onEvent: (e: "speech-start" | "speech-end") => void) => {
    voice.emit = onEvent;
    return { stop: voice.stop };
  }),
}));

import { LetterPractice } from "@/components/alphabet/letter-practice";
import { ALPHABET } from "@/data/alphabet";
import { getLessonProgress } from "@/lib/progress";

class FakeRecorder {
  static instances: FakeRecorder[] = [];
  state: "inactive" | "recording" = "inactive";
  mimeType = "audio/webm";
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  constructor(public stream: MediaStream) {
    FakeRecorder.instances.push(this);
  }
  start() {
    this.state = "recording";
  }
  stop() {
    this.state = "inactive";
    this.ondataavailable?.({ data: new Blob(["audio-bytes"]) });
    this.onstop?.();
  }
}

const getUserMedia = vi.fn();
const fetchMock = vi.fn();
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const json = (body: unknown, status = 200) => ({ ok: status < 300, status, json: async () => body });

function answer(passed: boolean, { rule = passed ? "excellent" : "said_taa_instead_of_baa", iqra = ["B", "AA"] } = {}) {
  return json({
    passed,
    scores: { accuracy: 80 },
    feedback: { rule, message: "" },
    conditionEvaluation: { azureAccuracy: 80, iqraPhonemes: iqra, matchedRule: rule, message: "" },
  });
}

/** Waits until the drill listens, then "speaks" for half a second. */
async function speak() {
  await waitFor(() => expect(screen.getByTestId("drill")).toHaveAttribute("data-state", "listening"));
  act(() => voice.emit!("speech-start"));
  expect(screen.getByTestId("drill")).toHaveAttribute("data-state", "speaking");
  await act(() => wait(450));
  act(() => voice.emit!("speech-end"));
}

function setProgress(passed: string[]) {
  window.localStorage.setItem("alif:progress:v1", JSON.stringify({ "a0/alphabet": { passed } }));
}

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, "", "/a0/letters/alif");
  FakeRecorder.instances = [];
  tts.speak.mockClear();
  voice.emit = null;
  getUserMedia.mockReset().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] });
  fetchMock.mockReset();
  Object.defineProperty(navigator, "mediaDevices", { value: { getUserMedia }, configurable: true });
  vi.stubGlobal("MediaRecorder", FakeRecorder);
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("A0 hands-free letter drill", () => {
  it("listens on its own and has no Record / Listen / Try again / Weiter buttons", async () => {
    render(<LetterPractice letterId="alif" nextLevelHref="/a1" />);
    await waitFor(() => expect(screen.getByTestId("drill")).toHaveAttribute("data-state", "listening"));
    expect(getUserMedia).toHaveBeenCalledTimes(1);
    // The letter's name is spoken before the microphone opens.
    expect(tts.speak).toHaveBeenCalledWith("أَلِف");
    expect(tts.speak.mock.invocationCallOrder[0]).toBeLessThan(getUserMedia.mock.invocationCallOrder[0]!);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.queryByText(/Aufnehmen|Anhören|Nochmal|Weiter$/)).toBeNull();
    expect(screen.getByTestId("drill-status")).toHaveTextContent("Sprich jetzt");
  });

  it("wrong → says the letter and listens again; right → ممتاز and the next letter follows by itself", async () => {
    setProgress(["alif"]);
    window.history.replaceState(null, "", "/a0/letters/baa");
    fetchMock.mockResolvedValueOnce(answer(false)).mockResolvedValueOnce(answer(false)).mockResolvedValueOnce(answer(true));
    render(<LetterPractice letterId="baa" nextLevelHref="/a1" />);

    await speak();
    await waitFor(() => expect(screen.getByTestId("drill-feedback")).toHaveAttribute("data-result", "incorrect"));
    expect(screen.getByTestId("drill-target")).toHaveTextContent("بَاء");
    expect(tts.speak).toHaveBeenLastCalledWith("بَاء");
    expect(screen.queryByText(/حاول مرة أخرى|Nochmal versuchen/)).toBeNull();

    await speak();
    await waitFor(() => expect(screen.getByTestId("drill-feedback")).toHaveAttribute("data-result", "incorrect"));
    await waitFor(() => expect(screen.getByTestId("drill-attempt")).toHaveTextContent("Versuch 3"));
    expect(screen.getByTestId("letter-glyph")).toHaveTextContent("ب");

    await speak();
    await waitFor(() => expect(screen.getByTestId("drill-feedback")).toHaveAttribute("data-result", "correct"));
    expect(screen.getByTestId("drill-feedback")).toHaveTextContent("مُمْتَاز");
    expect(tts.speak).toHaveBeenLastCalledWith("مُمْتَاز");
    expect(getLessonProgress("a0/alphabet").passed).toContain("baa");

    await waitFor(() => expect(screen.getByTestId("letter-glyph")).toHaveTextContent("ت"));
    expect(window.location.pathname).toBe("/a0/letters/taa");
    await waitFor(() => expect(screen.getByTestId("drill")).toHaveAttribute("data-state", "listening"));
    expect(screen.queryByTestId("drill-attempt")).toBeNull();
    // Spoken before each of the three attempts on ب, then once for ت.
    expect(tts.speak.mock.calls.map(([text]) => text)).toEqual(["بَاء", "بَاء", "بَاء", "مُمْتَاز", "تَاء"]);
    expect(fetchMock.mock.calls.map(([, init]) => (init.body as FormData).get("target"))).toEqual(["باء", "باء", "باء"]);
  });

  it("silence or unclear audio is not an attempt; after a few in a row it waits for a tap", async () => {
    fetchMock.mockResolvedValue(json({ code: "unclear_audio" }, 422));
    render(<LetterPractice letterId="alif" nextLevelHref="/a1" />);

    await speak();
    await waitFor(() => expect(screen.getByTestId("drill-status")).toHaveTextContent("nicht verstanden"));
    expect(screen.queryByTestId("drill-attempt")).toBeNull();
    await speak();
    await speak();
    await waitFor(() => expect(screen.getByTestId("drill")).toHaveAttribute("data-state", "paused"));

    fetchMock.mockReset().mockResolvedValue(answer(true, { iqra: ["A"] }));
    fireEvent.click(screen.getByTestId("drill-resume"));
    await speak();
    await waitFor(() => expect(screen.getByTestId("drill-feedback")).toHaveAttribute("data-result", "correct"));
  });

  it("a technical error stops the loop with a clear message; it is not counted as a mistake", async () => {
    fetchMock.mockResolvedValueOnce(json({ code: "service_unavailable" }, 502)).mockResolvedValueOnce(answer(true, { iqra: ["A"] }));
    render(<LetterPractice letterId="alif" nextLevelHref="/a1" />);

    await speak();
    expect(await screen.findByTestId("drill-error")).toHaveTextContent("vorübergehend nicht erreichbar");
    expect(screen.getByTestId("drill")).toHaveAttribute("data-state", "error");
    expect(screen.queryByTestId("drill-attempt")).toBeNull();

    fireEvent.click(screen.getByTestId("drill-retry"));
    await speak();
    await waitFor(() => expect(screen.getByTestId("drill-feedback")).toHaveAttribute("data-result", "correct"));
  });

  it("IQRA outage (no phonemes, no rule) is a technical error, not a wrong pronunciation", async () => {
    fetchMock.mockResolvedValueOnce(answer(false, { rule: "no_matching_rule", iqra: [] }));
    render(<LetterPractice letterId="alif" nextLevelHref="/a1" />);
    await speak();
    expect(await screen.findByTestId("drill-error")).toHaveTextContent("Lautanalyse ist gerade nicht verfügbar");
    expect(screen.getByTestId("letter-skip")).toBeInTheDocument();
  });

  it("microphone denied → explained, no endless loop", async () => {
    getUserMedia.mockRejectedValue(new DOMException("denied", "NotAllowedError"));
    render(<LetterPractice letterId="alif" nextLevelHref="/a1" />);
    expect(await screen.findByTestId("drill-error")).toHaveTextContent("Mikrofonzugriff wurde nicht erlaubt");
    await act(() => wait(300));
    expect(getUserMedia).toHaveBeenCalledTimes(1);
  });

  it("ends the round with the score from the attempts and can repeat it", async () => {
    const before = ALPHABET.slice(0, 26).map((l) => l.id);
    setProgress(before);
    window.history.replaceState(null, "", "/a0/letters/waaw");
    fetchMock
      .mockResolvedValueOnce(answer(true, { iqra: ["W"] }))
      .mockResolvedValueOnce(answer(false))
      .mockResolvedValueOnce(answer(true, { iqra: ["Y"] }));
    render(<LetterPractice letterId="waaw" nextLevelHref="/a1" />);

    await speak();
    await waitFor(() => expect(screen.getByTestId("letter-glyph")).toHaveTextContent("ي"));
    await speak();
    await waitFor(() => expect(screen.getByTestId("drill-feedback")).toHaveAttribute("data-result", "incorrect"));
    await speak();

    const result = await screen.findByTestId("round-result", {}, { timeout: 3000 });
    expect(result).toHaveAttribute("data-score", "95");
    expect(screen.getByTestId("round-score")).toHaveTextContent("Dein Ergebnis: 95 %");
    expect(screen.getByTestId("round-rating")).toHaveTextContent("ممتاز");
    expect(screen.getByTestId("round-letter-waaw")).toHaveAttribute("data-attempts", "1");
    expect(screen.getByTestId("round-letter-yaa")).toHaveAttribute("data-attempts", "2");
    expect(screen.getByTestId("alphabet-complete")).toHaveAttribute("data-complete", "true");

    fireEvent.click(screen.getByTestId("round-restart"));
    await waitFor(() => expect(screen.getByTestId("letter-glyph")).toHaveTextContent("و"));
    expect(window.location.pathname).toBe("/a0/letters/waaw");
  });
});
