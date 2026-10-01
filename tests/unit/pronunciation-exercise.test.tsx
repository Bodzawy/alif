import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/audio/wav", () => ({
  blobTo16KhzMonoWav: vi.fn(async () => new Blob(["RIFFtest"], { type: "audio/wav" })),
}));
const tts = vi.hoisted(() => ({ speak: vi.fn(async () => undefined), stop: vi.fn() }));
vi.mock("@/lib/tts/player", () => ({ speakArabic: tts.speak, stopSpeaking: tts.stop }));

import { PronunciationExercise } from "@/components/pronunciation/pronunciation-exercise";
import { API_ERROR_MESSAGES } from "@/lib/pronunciation/errors";
import { MIC_CONSTRAINTS } from "@/lib/audio/recording";

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

const track = { stop: vi.fn() };
const getUserMedia = vi.fn();
const fetchMock = vi.fn();

const exercise = { id: "letter", target: "ألف", modelText: "أَلِف" };
const okBody = (passed: boolean, rule = passed ? "excellent" : "correct_letter_needs_improvement") => ({
  target: "ألف",
  recognized: "ألف",
  passed,
  failureReason: passed ? null : "rule_not_matched",
  scores: { accuracy: passed ? 84 : 61, pronunciation: 80, fluency: 80, completeness: 100 },
  feedback: { rule, message: passed ? "ممتاز 👏 نطقت حرف الألف بشكل صحيح" : " حاول تحسين طريقة النطق" },
  details: { masaar: null, iqra: null, azure: { recognized: "ألف", accuracy: 84 } },
  conditionEvaluation: {
    target: "ألف",
    azureAccuracy: passed ? 84 : 61,
    azureRecognized: "ألف",
    iqraPhonemes: [],
    matchedRule: rule,
    message: passed ? "ممتاز 👏 نطقت حرف الألف بشكل صحيح" : " حاول تحسين طريقة النطق",
    conditions: [],
  },
  discrimination: {},
  words: [],
});
const json = (body: unknown, status = 200) => ({ ok: status < 300, status, json: async () => body });
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function recordOnce() {
  fireEvent.click(screen.getByTestId("exercise-letter-record"));
  await waitFor(() => expect(screen.getByTestId("exercise-letter").dataset.phase).toBe("recording"));
  await act(() => wait(450)); // recordings under 400 ms are rejected
  fireEvent.click(screen.getByTestId("exercise-letter-record"));
}

beforeEach(() => {
  FakeRecorder.instances = [];
  track.stop.mockClear();
  tts.speak.mockClear();
  getUserMedia.mockReset().mockResolvedValue({ getTracks: () => [track] });
  fetchMock.mockReset().mockResolvedValue(json(okBody(true)));
  Object.defineProperty(navigator, "mediaDevices", { value: { getUserMedia }, configurable: true });
  vi.stubGlobal("MediaRecorder", FakeRecorder);
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("PronunciationExercise", () => {
  it("records with unprocessed mic audio, submits a WAV and shows success feedback", async () => {
    const onResult = vi.fn();
    render(<PronunciationExercise exercise={exercise} onResult={onResult} />);
    await recordOnce();

    await screen.findByTestId("exercise-letter-feedback");
    expect(getUserMedia).toHaveBeenCalledWith({ audio: MIC_CONSTRAINTS });
    expect(track.stop).toHaveBeenCalled();

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/pronunciation");
    expect((init.body as FormData).get("target")).toBe("ألف");

    expect(screen.getByText("Ausgezeichnet!")).toBeInTheDocument();
    expect(screen.getByTestId("exercise-letter-feedback-message")).toHaveTextContent("ممتاز 👏 نطقت حرف الألف بشكل صحيح");
    expect(screen.getByText("84 %")).toBeInTheDocument();
    expect(onResult).toHaveBeenCalledWith(expect.objectContaining({ passed: true }));
    expect(tts.speak).toHaveBeenCalledWith("مُمْتَاز");
  });

  it("offers a retry after a failed attempt and records again", async () => {
    fetchMock.mockResolvedValueOnce(json(okBody(false))).mockResolvedValueOnce(json(okBody(true)));
    render(<PronunciationExercise exercise={exercise} />);
    await recordOnce();

    await screen.findByText("Fast geschafft");
    expect(screen.getByTestId("exercise-letter-feedback-message")).toHaveTextContent("حاول تحسين طريقة النطق");
    expect(tts.speak).toHaveBeenCalledWith("حاول مرة أخرى");

    fireEvent.click(screen.getByTestId("exercise-letter-feedback-retry"));
    await waitFor(() => expect(FakeRecorder.instances).toHaveLength(2));
    await act(() => wait(450));
    fireEvent.click(screen.getByTestId("exercise-letter-record"));
    await screen.findByText("Ausgezeichnet!");
  });

  it("auto-stops after the maximum recording time", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      render(<PronunciationExercise exercise={exercise} />);
      fireEvent.click(screen.getByTestId("exercise-letter-record"));
      await waitFor(() => expect(FakeRecorder.instances[0]?.state).toBe("recording"));
      await act(async () => {
        vi.advanceTimersByTime(3600);
      });
      expect(FakeRecorder.instances[0]!.state).toBe("inactive");
    } finally {
      vi.useRealTimers();
    }
    await screen.findByTestId("exercise-letter-feedback");
  });

  it("explains a denied microphone permission in German", async () => {
    getUserMedia.mockRejectedValue(new DOMException("denied", "NotAllowedError"));
    render(<PronunciationExercise exercise={exercise} />);
    fireEvent.click(screen.getByTestId("exercise-letter-record"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Mikrofonzugriff wurde nicht erlaubt");
  });

  it("rejects too-short recordings without calling the API", async () => {
    render(<PronunciationExercise exercise={exercise} />);
    fireEvent.click(screen.getByTestId("exercise-letter-record"));
    await waitFor(() => expect(screen.getByTestId("exercise-letter").dataset.phase).toBe("recording"));
    fireEvent.click(screen.getByTestId("exercise-letter-record"));
    expect(await screen.findByRole("alert")).toHaveTextContent("zu kurz");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows the service message when the API is unavailable", async () => {
    fetchMock.mockResolvedValue(json({ error: "x", code: "service_unavailable" }, 502));
    render(<PronunciationExercise exercise={exercise} />);
    await recordOnce();
    expect(await screen.findByRole("alert")).toHaveTextContent(API_ERROR_MESSAGES.service_unavailable);
  });

  it("does not start while another exercise is busy", () => {
    render(<PronunciationExercise exercise={exercise} locked />);
    expect(screen.getByTestId("exercise-letter-record")).toBeDisabled();
  });
});
