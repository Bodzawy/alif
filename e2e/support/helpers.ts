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
