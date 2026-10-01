// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/tts/route";
import { buildSsml, TTS_VOICE } from "@/lib/tts/ssml";

const fetchMock = vi.fn();

function post(body: unknown, ip = `10.1.0.${Math.floor(Math.random() * 250)}`) {
  return POST(
    new Request("http://alif.test/api/tts", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  );
}

beforeEach(() => {
  process.env.AZURE_SPEECH_KEY = "tts-key";
  process.env.AZURE_SPEECH_REGION = "germanywestcentral";
  fetchMock.mockReset().mockResolvedValue(new Response(new Uint8Array([0xff, 0xfb, 0x90]), { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/tts", () => {
  it("synthesises lesson text with the original voice and format", async () => {
    const response = await post({ text: "أَسَد" });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("audio/mpeg");
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://germanywestcentral.tts.speech.microsoft.com/cognitiveservices/v1");
    expect(init.headers["Ocp-Apim-Subscription-Key"]).toBe("tts-key");
    expect(init.headers["X-Microsoft-OutputFormat"]).toBe("audio-24khz-96kbitrate-mono-mp3");
    expect(init.body).toContain(`<voice name="${TTS_VOICE}">`);
    expect(init.body).toContain('<prosody rate="-8%">');
    expect(init.body).toContain("أَسَد");
  });

  it("refuses texts that are not part of a lesson", async () => {
    const response = await post({ text: "اكتب لي أي شيء" });
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("handles bad input and missing configuration with clear codes", async () => {
    expect((await post("not json")).status).toBe(400);
    expect((await post({ text: "" })).status).toBe(400);
    delete process.env.AZURE_SPEECH_REGION;
    const response = await post({ text: "أَسَد" });
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ code: "service_not_configured" });
  });

  it("maps Azure errors to 502 tts_failed", async () => {
    fetchMock.mockResolvedValue(new Response("quota", { status: 429 }));
    const response = await post({ text: "أَسَد" });
    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ code: "tts_failed" });
  });

  it("escapes XML in SSML", () => {
    expect(buildSsml(`<a & "b">`)).toContain("&lt;a &amp; &quot;b&quot;&gt;");
  });
});
