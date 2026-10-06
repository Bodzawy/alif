import { expect, type Page, type Request } from "@playwright/test";

/** Records ~1.5 s from the (fake) microphone for one exercise. */
export async function recordExercise(page: Page, id: string, ms = 1500) {
  const exercise = page.getByTestId(`exercise-${id}`);
  await page.getByTestId(`exercise-${id}-record`).click();
  await expect(exercise).toHaveAttribute("data-phase", "recording");
  await page.waitForTimeout(ms);
  await page.getByTestId(`exercise-${id}-record`).click();
}

export type UploadInfo = {
  target: string | null;
  fileName: string | null;
  riff: string;
  wave: string;
  channels: number;
  sampleRate: number;
  bits: number;
  bytes: number;
};

/** Parses the multipart upload sent to /api/pronunciation. */
export function parseUpload(request: Request): UploadInfo {
  const body = request.postDataBuffer() ?? Buffer.alloc(0);
  const text = body.toString("latin1");
  const target = /name="target"\r\n\r\n([^\r]*)\r\n/.exec(text)?.[1];
  const riff = body.indexOf(Buffer.from("RIFF"));
  const end = body.indexOf(Buffer.from("\r\n--"), riff);
  return {
    target: target ? Buffer.from(target, "latin1").toString("utf8") : null,
    fileName: /name="audio"; filename="([^"]+)"/.exec(text)?.[1] ?? null,
    riff: body.subarray(riff, riff + 4).toString("latin1"),
    wave: body.subarray(riff + 8, riff + 12).toString("latin1"),
    channels: body.readUInt16LE(riff + 22),
    sampleRate: body.readUInt32LE(riff + 24),
    bits: body.readUInt16LE(riff + 34),
    bytes: end - riff,
  };
}

export function collectPageErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    // Failed /api calls are expected in the error-path tests and logged by the browser.
    if (message.type() === "error" && !/Failed to load resource/.test(message.text())) errors.push(message.text());
  });
  return errors;
}

/**
 * Hands-free A0: replaces the microphone with a synthetic "student" who says
 * something shortly after each listening window opens (0.4 s silence, 0.5 s
 * tone, then silence). Recording, voice detection, WAV conversion and upload
 * stay real.
 */
export async function installFakeVoice(page: Page) {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      const context = new AudioContext();
      await context.resume();
      const oscillator = context.createOscillator();
      oscillator.frequency.value = 220;
      const gain = context.createGain();
      const destination = context.createMediaStreamDestination();
      oscillator.connect(gain).connect(destination);
      const t = context.currentTime;
      gain.gain.setValueAtTime(0, t);
      gain.gain.setValueAtTime(0.5, t + 0.4);
      gain.gain.setValueAtTime(0, t + 0.9);
      oscillator.start();
      const track = destination.stream.getAudioTracks()[0]!;
      const stopTrack = track.stop.bind(track);
      track.stop = () => {
        stopTrack();
        void context.close();
      };
      return destination.stream;
    };
  });
}
