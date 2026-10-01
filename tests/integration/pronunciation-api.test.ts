// @vitest-environment node
import { createServer, type IncomingMessage, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { encodeWav } from "@/lib/audio/wav";
import type { AzureAssessment } from "@/lib/pronunciation/types";

// Azure Speech is the only part replaced: it needs real credentials and
// Microsoft's network. MASAAR and IQRA are real HTTP servers below.
const azureMock = vi.hoisted(() => ({ assess: vi.fn() }));
vi.mock("@/lib/pronunciation/services/azure", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/pronunciation/services/azure")>();
  return { ...original, assessWithAzure: azureMock.assess };
});

const { POST } = await import("@/app/api/pronunciation/route");
const { AzureSpeechError } = await import("@/lib/pronunciation/services/azure");

type Captured = { path: string; apiKey: string | undefined; contentType: string | undefined; body: Buffer };

function modelServer(reply: () => { status: number; body: unknown; delayMs?: number }) {
  const requests: Captured[] = [];
  const server = createServer(async (req: IncomingMessage, res) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    requests.push({
      path: req.url ?? "",
      apiKey: req.headers["x-internal-api-key"] as string | undefined,
      contentType: req.headers["content-type"],
      body: Buffer.concat(chunks),
    });
    const { status, body, delayMs } = reply();
    setTimeout(() => {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify(body));
    }, delayMs ?? 0);
  });
  return { server, requests };
}

const masaarReply = { status: 200, body: { letter: "أ", confidence: 0.93, top3: [{ letter: "أ", confidence: 0.93 }] } as unknown };
let iqraReply: { status: number; body: unknown } = { status: 200, body: { sequence: "b aa", phonemes: ["b", "aa"], duration: 0.8 } };

const masaar = modelServer(() => masaarReply);
const iqra = modelServer(() => iqraReply);

function listen(server: Server) {
  return new Promise<string>((resolve) => server.listen(0, "127.0.0.1", () => resolve(`http://127.0.0.1:${(server.address() as AddressInfo).port}`)));
}

async function wavFile(ms = 600) {
  const samples = new Float32Array((16000 * ms) / 1000).map((_, i) => 0.3 * Math.sin(i / 8));
  return new File([await encodeWav(samples, 16000).arrayBuffer()], "voice.wav", { type: "audio/wav" });
}

async function post(fields: Record<string, string | File>, ip = `10.0.0.${Math.floor(Math.random() * 250)}`) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  return POST(new Request("http://alif.test/api/pronunciation", { method: "POST", body: form, headers: { "x-forwarded-for": ip } }));
}

function azureResult(overrides: Partial<AzureAssessment> = {}): AzureAssessment {
  return { referenceText: "باء", recognized: "باء.", accuracy: 86, pronunciation: 84, fluency: 90, completeness: 100, firstSoundScore: 80, words: [], ...overrides };
}

beforeAll(async () => {
  process.env.MASAAR_URL = `${await listen(masaar.server)}/`; // trailing slash is tolerated
  process.env.IQRA_URL = await listen(iqra.server);
});

afterAll(() => {
  masaar.server.close();
  iqra.server.close();
});

beforeEach(() => {
  process.env.AZURE_SPEECH_KEY = "test-key";
  process.env.AZURE_SPEECH_REGION = "germanywestcentral";
  process.env.INTERNAL_API_KEY = "internal-secret";
  masaar.requests.length = 0;
  iqra.requests.length = 0;
  iqraReply = { status: 200, body: { sequence: "b aa", phonemes: ["b", "aa"], duration: 0.8 } };
  azureMock.assess.mockReset().mockResolvedValue(azureResult());
  vi.spyOn(console, "log").mockImplementation(() => undefined);
  vi.spyOn(console, "info").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => vi.restoreAllMocks());

describe("POST /api/pronunciation", () => {
  it("runs Azure, MASAAR and IQRA, applies the condition engine and returns feedback", async () => {
    const audio = await wavFile();
    const response = await post({ audio, target: "باء" });
    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body).toMatchObject({
      target: "باء",
      passed: true,
      failureReason: null,
      feedback: { rule: "excellent", message: "ممتاز 👏 نطقت حرف الباء بشكل صحيح" },
      details: { masaar: { letter: "أ", confidence: 0.93 }, iqra: { phonemes: ["b", "aa"] }, azure: { accuracy: 86 } },
      conditionEvaluation: { matchedRule: "excellent", iqraPhonemes: ["b", "aa"], conditions: ["azure_accuracy >= 70", "iqra_phonemes contains b"] },
    });

    // Azure received the exact uploaded bytes and the target as reference text.
    const [azureAudio, reference, config] = azureMock.assess.mock.calls[0]!;
    expect(reference).toBe("باء");
    expect(config).toEqual({ key: "test-key", region: "germanywestcentral" });
    expect(Buffer.compare(azureAudio as Buffer, Buffer.from(await audio.arrayBuffer()))).toBe(0);

    // MASAAR and IQRA: POST <base>/predict, multipart "audio" = voice.wav, internal key header.
    for (const service of [masaar, iqra]) {
      expect(service.requests).toHaveLength(1);
      const request = service.requests[0]!;
      expect(request.path).toBe("/predict");
      expect(request.apiKey).toBe("internal-secret");
      expect(request.contentType).toMatch(/^multipart\/form-data/);
      expect(request.body.toString("latin1")).toContain('name="audio"; filename="voice.wav"');
      expect(request.body.includes(Buffer.from(await audio.arrayBuffer()))).toBe(true);
    }
  });

  it("returns retry feedback from the matched rule (ثاء said as س)", async () => {
    iqraReply = { status: 200, body: { phonemes: ["s", "aa"] } };
    azureMock.assess.mockResolvedValue(azureResult({ referenceText: "ثاء", recognized: "ساء" }));
    const body = await (await post({ audio: await wavFile(), target: "ثاء" })).json();
    expect(body.passed).toBe(false);
    expect(body.failureReason).toBe("rule_not_matched");
    expect(body.feedback.rule).toBe("said_sin");
  });

  it("evaluates Lesson 1 vocabulary words", async () => {
    azureMock.assess.mockResolvedValue(azureResult({ referenceText: "أسد", recognized: "أسد", accuracy: 74 }));
    const body = await (await post({ audio: await wavFile(), target: "أسد" })).json();
    expect(body).toMatchObject({ passed: true, feedback: { rule: "excellent" } });
  });

  it("continues without IQRA when it fails, but never reports a pass that needs its phonemes", async () => {
    iqraReply = { status: 500, body: { error: "boom" } };
    const body = await (await post({ audio: await wavFile(), target: "باء" })).json();
    expect(body.details.iqra).toBeNull();
    expect(body.passed).toBe(false);
    expect(body.feedback.rule).toBe("no_matching_rule");
  });

  it("treats { ok: false } from a model service as unavailable", async () => {
    iqraReply = { status: 200, body: { ok: false } };
    const body = await (await post({ audio: await wavFile(), target: "ألف" })).json();
    expect(body.details.iqra).toBeNull();
    expect(body.passed).toBe(true); // ألف needs Azure only
  });

  it("does not send the internal key header when none is configured", async () => {
    delete process.env.INTERNAL_API_KEY;
    await post({ audio: await wavFile(), target: "ألف" });
    expect(masaar.requests[0]!.apiKey).toBeUndefined();
  });

  it("answers 422 unclear_audio when Azure recognises no speech", async () => {
    azureMock.assess.mockResolvedValue(azureResult({ accuracy: null, pronunciation: null, recognized: "" }));
    const response = await post({ audio: await wavFile(), target: "ألف" });
    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({ code: "unclear_audio" });
  });

  it("answers 502/504 service_unavailable when Azure fails or times out", async () => {
    azureMock.assess.mockRejectedValue(new AzureSpeechError("canceled", "canceled"));
    expect((await post({ audio: await wavFile(), target: "ألف" })).status).toBe(502);
    azureMock.assess.mockRejectedValue(new AzureSpeechError("slow", "timeout"));
    const timeout = await post({ audio: await wavFile(), target: "ألف" });
    expect(timeout.status).toBe(504);
    expect(await timeout.json()).toMatchObject({ code: "service_unavailable" });
  });

  it("answers 503 when Azure is not configured, before calling any service", async () => {
    delete process.env.AZURE_SPEECH_KEY;
    const response = await post({ audio: await wavFile(), target: "ألف" });
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ code: "service_not_configured" });
    expect(masaar.requests).toHaveLength(0);
    expect(azureMock.assess).not.toHaveBeenCalled();
  });

  it("validates input: target, audio presence, WAV format, duration", async () => {
    expect(await (await post({ audio: await wavFile(), target: "hack" })).json()).toMatchObject({ code: "invalid_target" });
    expect(await (await post({ target: "ألف" })).json()).toMatchObject({ code: "invalid_audio" });
    const notWav = new File(["this is definitely not a RIFF/WAVE audio file....."], "voice.wav");
    const invalid = await post({ audio: notWav, target: "ألف" });
    expect(invalid.status).toBe(400);
    expect(await invalid.json()).toMatchObject({ code: "invalid_audio" });
    expect(await (await post({ audio: await wavFile(20), target: "ألف" })).json()).toMatchObject({ code: "audio_too_short" });
    expect(azureMock.assess).not.toHaveBeenCalled();
  });

  it("rejects oversized uploads with 413", async () => {
    const big = new File([new Uint8Array(2 * 1024 * 1024 + 1)], "voice.wav");
    const response = await post({ audio: big, target: "ألف" });
    expect(response.status).toBe(413);
  });

  it("rate-limits a single client", async () => {
    const audio = await wavFile();
    let last: Response | undefined;
    for (let i = 0; i < 31; i++) last = await post({ audio, target: "ألف" }, "192.0.2.77");
    expect(last!.status).toBe(429);
    expect(last!.headers.get("retry-after")).toBeTruthy();
  });
});
