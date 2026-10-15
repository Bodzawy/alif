import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, test, type Page, type Request } from "@playwright/test";

import { TRIM_SILENCE } from "../src/lib/audio/trim-silence";
import { toneWav } from "./support/audio";
import { collectPageErrors } from "./support/helpers";

// The silence before and after the speech is cut in the browser before the
// upload (src/lib/audio/trim-silence.ts). Real path: the microphone plays a
// real Arabic recording (tests/fixtures/arabic-speech) with silence around it;
// MediaRecorder, decoding, 16 kHz conversion, trimming and the upload run as in
// the app. /api/pronunciation and /api/tts are answered here – no service is called.

const fixture = (name: string) => readFileSync(path.join(__dirname, "../tests/fixtures/arabic-speech", `${name}.wav`));

/** Duration (ms) and peak of a 16 kHz 16-bit mono WAV inside a buffer. */
function wavInfo(buffer: Buffer, from = 0) {
  const riff = buffer.indexOf(Buffer.from("RIFF"), from);
  let offset = riff + 12;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("latin1", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (id === "data") {
      const length = Math.min(size, buffer.length - offset - 8);
      let peak = 0;
      for (let i = 0; i + 1 < length; i += 2) peak = Math.max(peak, Math.abs(buffer.readInt16LE(offset + 8 + i)) / 0x8000);
      return { ms: size / 32, peak, sampleRate: buffer.readUInt32LE(riff + 24) };
    }
    offset += 8 + size + (size % 2);
  }
  throw new Error("no data chunk");
}

type Upload = { target: string | null; recordedMs: number | null; sentMs: number; peak: number; sampleRate: number };

function readUpload(request: Request): Upload {
  const body = request.postDataBuffer() ?? Buffer.alloc(0);
  const text = body.toString("latin1");
  const field = (name: string) => new RegExp(`name="${name}"\\r\\n\\r\\n([^\\r]*)\\r\\n`).exec(text)?.[1] ?? null;
  const target = field("target");
  const recorded = field("recordedMs");
  const wav = wavInfo(body);
  return { target: target ? Buffer.from(target, "latin1").toString("utf8") : null, recordedMs: recorded === null ? null : Number(recorded), sentMs: wav.ms, peak: wav.peak, sampleRate: wav.sampleRate };
}

/** The microphone "says" the fixture `leadMs` after it opens, then again every `periodMs`. */
async function arabicVoice(page: Page, name: string, leadMs = 1000, periodMs = 3500) {
  await page.addInitScript(
    ({ base64, leadMs, periodMs }) => {
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      navigator.mediaDevices.getUserMedia = async () => {
        const context = new AudioContext();
        await context.resume();
        const buffer = await context.decodeAudioData(bytes.buffer.slice(0));
        const destination = context.createMediaStreamDestination();
        const t = context.currentTime;
        for (let k = 0; k < 40; k++) {
          const source = context.createBufferSource();
          source.buffer = buffer;
          source.connect(destination);
          source.start(t + (leadMs + k * periodMs) / 1000);
        }
        const track = destination.stream.getAudioTracks()[0]!;
        const stop = track.stop.bind(track);
        track.stop = () => {
          stop();
          void context.close();
        };
        return destination.stream;
      };
    },
    { base64: fixture(name).toString("base64"), leadMs, periodMs }
  );
}

async function answerServices(page: Page) {
  const calls = { uploads: [] as Upload[], tts: [] as string[] };
  await page.route("**/api/tts", async (route) => {
    calls.tts.push(route.request().postDataJSON().text);
    await route.fulfill({ status: 200, contentType: "audio/wav", body: toneWav(200) });
  });
  await page.route("**/api/pronunciation", async (route) => {
    calls.uploads.push(readUpload(route.request()));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ passed: true, scores: { accuracy: 90 }, feedback: { rule: "excellent", message: "" }, conditionEvaluation: { azureAccuracy: 90, iqraPhonemes: ["a"], matchedRule: "excellent", message: "" } }),
    });
  });
  return calls;
}

/** Length of the speech in the fixture itself. */
const speechMs = (name: string) => wavInfo(fixture(name)).ms;

test("button mode: recorded 2.8 s (speech after 1 s), only the speech ± padMs is sent – 16 kHz WAV, speech intact", async ({ page }) => {
  const errors = collectPageErrors(page);
  await arabicVoice(page, "alif");
  const calls = await answerServices(page);
  await page.goto("/a0/words/lesson-1");

  const exercise = page.getByTestId("exercise-letter");
  await page.getByTestId("exercise-letter-record").click();
  await expect(exercise).toHaveAttribute("data-phase", "recording");
  await page.waitForTimeout(2800);
  await page.getByTestId("exercise-letter-record").click();
  await expect(exercise).toHaveAttribute("data-phase", "result");

  expect(calls.uploads).toHaveLength(1);
  const upload = calls.uploads[0]!;
  console.log(`button mode · alif: recorded ${upload.recordedMs} ms → sent ${Math.round(upload.sentMs)} ms (speech ${Math.round(speechMs("alif"))} ms)`);
  expect(upload).toMatchObject({ target: "ألف", sampleRate: 16000 });
  expect(upload.recordedMs!).toBeGreaterThan(2500);
  // The speech is kept whole (plus margins) …
  expect(upload.sentMs).toBeGreaterThanOrEqual(speechMs("alif"));
  expect(upload.peak).toBeGreaterThan(0.1);
  // … and the silence is gone: ~1 s before and ~1.3 s after.
  expect(upload.sentMs).toBeLessThan(speechMs("alif") + 2 * TRIM_SILENCE.padMs + 300);
  expect(upload.recordedMs! - upload.sentMs).toBeGreaterThan(1000);
  expect(errors).toEqual([]);
});

for (const name of ["ba", "saqf"]) {
  test(`guided mode (A1): the recording ended by voice detection is trimmed too (${name}); a right answer still plays "Super!"`, async ({ page }) => {
    test.setTimeout(60_000);
    const errors = collectPageErrors(page);
    await arabicVoice(page, name);
    const calls = await answerServices(page);
    await page.goto("/a1/lesson-1/alif/step-1");
    await page.getByTestId("start-button").click();

    await expect.poll(() => calls.uploads.length, { timeout: 20_000 }).toBeGreaterThanOrEqual(1);
    const upload = calls.uploads[0]!;
    console.log(`guided mode · ${name}: recorded ${upload.recordedMs} ms → sent ${Math.round(upload.sentMs)} ms (speech ${Math.round(speechMs(name))} ms)`);
    expect(upload.sampleRate).toBe(16000);
    expect(upload.recordedMs).not.toBeNull();
    expect(upload.sentMs).toBeGreaterThanOrEqual(speechMs(name));
    expect(upload.peak).toBeGreaterThan(0.1);
    // Voice detection waits 1 s of silence after the speech; that second (and the wait before it) is not sent.
    expect(upload.recordedMs! - upload.sentMs).toBeGreaterThan(300);
    expect(upload.sentMs).toBeLessThan(speechMs(name) + 2 * TRIM_SILENCE.padMs + 300);

    await expect.poll(() => calls.tts).toContain("Super!");
    expect(errors).toEqual([]);
  });
}
