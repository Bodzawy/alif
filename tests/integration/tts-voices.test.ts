// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/tts/route";
import { buildSsml, TTS_DIALOGUE_VOICES, TTS_VOICE } from "@/lib/tts/ssml";

// /api/tts with the dialogue speakers' voices: only the two allowed keys,
// mapped to two different male Azure voices; no voice = the lesson voice.

const fetchMock = vi.fn();
const post = (body: unknown) =>
  POST(new Request("http://alif.test/api/tts", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": `10.2.0.${Math.floor(Math.random() * 250)}` }, body: JSON.stringify(body) }));

beforeEach(() => {
  process.env.AZURE_SPEECH_KEY = "tts-key";
  process.env.AZURE_SPEECH_REGION = "germanywestcentral";
  fetchMock.mockReset().mockImplementation(async () => new Response(new Uint8Array([0xff, 0xfb, 0x90]), { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("/api/tts voices", () => {
  it("two different male and two different female voices", () => {
    expect(TTS_DIALOGUE_VOICES["male-1"]).not.toBe(TTS_DIALOGUE_VOICES["male-2"]);
    expect(TTS_DIALOGUE_VOICES["female-1"]).not.toBe(TTS_DIALOGUE_VOICES["female-2"]);
    expect(new Set(Object.values(TTS_DIALOGUE_VOICES)).size).toBe(4);
    expect(TTS_DIALOGUE_VOICES["female-1"]).toBe(TTS_VOICE); // the voice Alif already uses
    expect(buildSsml("صَبَاحُ النُّورِ.", "male-1")).toContain(`<voice name="${TTS_DIALOGUE_VOICES["male-1"]}">`);
    expect(buildSsml("صَبَاحُ النُّورِ.", "male-2")).toContain(`<voice name="${TTS_DIALOGUE_VOICES["male-2"]}">`);
    expect(buildSsml("صَبَاحُ النُّورِ.")).toContain(`<voice name="${TTS_VOICE}">`);
  });

  it("speaks a dialogue line in the requested speaker's voice", async () => {
    for (const voice of ["male-1", "male-2", "female-1", "female-2"] as const) {
      fetchMock.mockClear();
      const response = await post({ text: "صَبَاحُ النُّورِ.", voice });
      expect(response.status).toBe(200);
      expect(fetchMock.mock.calls[0]![1].body).toContain(`<voice name="${TTS_DIALOGUE_VOICES[voice]}">`);
    }
  });

  it("refuses any other voice (no free Azure voice names) and still checks the text", async () => {
    expect((await post({ text: "صَبَاحُ النُّورِ.", voice: "ar-EG-ShakirNeural" })).status).toBe(400);
    expect((await post({ text: "صَبَاحُ النُّورِ.", voice: 1 })).status).toBe(400);
    expect((await post({ text: "hello", voice: "male-1" })).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
