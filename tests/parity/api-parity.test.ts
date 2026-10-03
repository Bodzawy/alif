// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Both routes talk to this stand-in instead of Azure (see support/fake-speech-sdk.ts).
vi.mock("microsoft-cognitiveservices-speech-sdk", () => import("./support/fake-speech-sdk"));

import { POST as alifPOST } from "@/app/api/pronunciation/route";
import { POST as legacyPOST } from "../fixtures/legacy-masaar/src/app/api/pronunciation/route";
import legacyRules from "../fixtures/legacy-masaar/src/lib/pronunciation/letter_conditions.json";
import { ARABIC_LETTERS as LEGACY_LETTERS } from "../fixtures/legacy-masaar/src/lib/pronunciation/letters";
import type { AzureScenario } from "./support/fake-speech-sdk";

// Same request, same Azure result, same MASAAR/IQRA answers → the legacy
// Masaar route and Alif's route must answer identically (status and full JSON;
// Alif only adds `feedback`, which must equal conditionEvaluation's rule/message).

type Rules = Record<string, Record<string, { conditions: string[]; message: string }>>;
const RULES = legacyRules as Rules;
const g = globalThis as unknown as { __azure: AzureScenario; __azureCalls: Record<string, unknown>[] };

function wav(ms: number) {
  const n = (16000 * ms) / 1000;
  const b = Buffer.alloc(44 + n * 2);
  b.write("RIFF", 0); b.writeUInt32LE(36 + n * 2, 4); b.write("WAVE", 8); b.write("fmt ", 12);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(16000, 24);
  b.writeUInt32LE(32000, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.sin(i / 7) * 8000), 44 + i * 2);
  return b;
}
const AUDIO = wav(600);

type ModelReply = { kind: "json"; body: unknown } | { kind: "http"; status: number } | { kind: "throw" };
let masaarReply: ModelReply;
let iqraReply: ModelReply;
let fetchCalls: Record<string, unknown>[] = [];

async function fakeFetch(url: string, init: { body: FormData; headers?: Record<string, string>; method?: string }) {
  const audio = init.body.get("audio") as File;
  fetchCalls.push({
    url,
    method: init.method,
    apiKey: init.headers?.["X-Internal-Api-Key"] ?? null,
    fields: [...init.body.keys()].join(","),
    fileName: audio?.name,
    sameBytes: Buffer.compare(Buffer.from(await audio.arrayBuffer()), AUDIO) === 0,
  });
  const reply = url.includes("/masaar/") ? masaarReply : iqraReply;
  if (reply.kind === "throw") throw new TypeError("fetch failed");
  if (reply.kind === "http") return new Response("{}", { status: reply.status });
  return new Response(JSON.stringify(reply.body), { status: 200, headers: { "content-type": "application/json" } });
}

const MASAAR: Record<string, ModelReply> = {
  ok: { kind: "json", body: { letter: "ب", confidence: 0.87, top3: [{ letter: "ب", confidence: 0.87 }, { label: "ت", confidence: 0.1 }] } },
  okFalse: { kind: "json", body: { ok: false, error: "x" } },
  http500: { kind: "http", status: 500 },
  throw: { kind: "throw" },
  notObject: { kind: "json", body: "hello" },
};
const IQRA_FAILURES: Record<string, ModelReply> = {
  okFalse: { kind: "json", body: { ok: false } },
  http503: { kind: "http", status: 503 },
  unreachable: { kind: "throw" },
  nonArray: { kind: "json", body: { sequence: "b aa", phonemes: "b aa" } },
  mixedTypes: { kind: "json", body: { sequence: "b aa", phonemes: ["b", 3, null, "aa"], duration: 0.7 } },
  noPhonemesField: { kind: "json", body: { sequence: "b aa" } },
  emptyArray: { kind: "json", body: { sequence: "", phonemes: [], duration: 0.2 } },
};
const iqraPhonemes = (phonemes: string[]): ModelReply => ({ kind: "json", body: { sequence: phonemes.join(" "), phonemes, duration: 0.8 } });

const ENV = {
  AZURE_SPEECH_KEY: "k",
  AZURE_SPEECH_REGION: "germanywestcentral",
  MASAAR_URL: "http://models.test/masaar",
  IQRA_URL: "http://models.test/iqra",
  INTERNAL_API_KEY: "secret",
};
function setEnv(env: Partial<Record<keyof typeof ENV, string | undefined>>) {
  for (const key of Object.keys(ENV) as Array<keyof typeof ENV>) {
    if (env[key] === undefined) delete process.env[key];
    else process.env[key] = env[key];
  }
}

let ip = 0;
async function call(post: (request: Request) => Promise<Response>, target: string | null, withAudio = true) {
  const form = new FormData();
  if (withAudio) form.append("audio", new File([AUDIO], "voice.wav", { type: "audio/wav" }));
  if (target !== null) form.append("target", target);
  g.__azureCalls = [];
  fetchCalls = [];
  ip++;
  // A distinct client address per request keeps Alif's rate limiter out of the comparison.
  const headers = { "x-forwarded-for": `10.${(ip >> 16) & 255}.${(ip >> 8) & 255}.${ip & 255}` };
  const response = await post(new Request("http://alif.test/api/pronunciation", { method: "POST", body: form, headers }));
  return {
    status: response.status,
    body: await response.json(),
    azure: g.__azureCalls,
    fetches: [...fetchCalls].sort((a, b) => String(a.url).localeCompare(String(b.url))),
  };
}

async function both(target: string | null, withAudio = true) {
  return { legacy: await call(legacyPOST, target, withAudio), alif: await call(alifPOST, target, withAudio) };
}

function expectSame(label: string, { legacy, alif }: Awaited<ReturnType<typeof both>>) {
  expect(alif.status, label).toBe(legacy.status);
  expect(alif.azure, label).toEqual(legacy.azure);
  expect(alif.fetches, label).toEqual(legacy.fetches);
  if (legacy.status === 200) {
    const { feedback, ...rest } = alif.body;
    expect(rest, label).toEqual(legacy.body);
    expect(feedback, label).toEqual({ rule: legacy.body.conditionEvaluation.matchedRule, message: legacy.body.conditionEvaluation.message });
  }
}

function phonemeTokens(target: string) {
  const out: string[] = [];
  for (const rule of Object.values(RULES[target] ?? {})) {
    for (const condition of rule.conditions) {
      const match = condition.match(/^iqra_phonemes\s*(?:does not contain|contains)\s*(.+)$/);
      if (!match) continue;
      for (const p of match[1]!.replace(/[\[\]'\s]/g, "").split(",").filter(Boolean)) if (!out.includes(p)) out.push(p);
    }
  }
  return out;
}
function excellentPhonemes(target: string) {
  return RULES[target]!.excellent!.conditions
    .map((c) => c.match(/^iqra_phonemes\s+contains\s+(.+)$/)?.[1])
    .filter((list): list is string => Boolean(list))
    .flatMap((list) => list.replace(/[\[\]'\s]/g, "").split(",").filter(Boolean));
}
const subsets = <T,>(items: T[]) => items.reduce<T[][]>((acc, item) => acc.concat(acc.map((s) => [...s, item])), [[]]);
function wordsJson(accuracy: number | undefined, firstSound: number | undefined) {
  if (firstSound === undefined) return "";
  return JSON.stringify({ NBest: [{ Words: [{ Word: "x", PronunciationAssessment: { AccuracyScore: accuracy, ErrorType: "None" },
    Phonemes: [{ Phoneme: "b", PronunciationAssessment: { AccuracyScore: firstSound } }, { Phoneme: "aa", PronunciationAssessment: { AccuracyScore: 77 } }, { Phoneme: "x" }] }] }] });
}
const recognised = (target: string, accuracy: number, extra: Partial<AzureScenario> = {}): AzureScenario => ({
  reason: "Recognized", text: target, accuracy, pronunciation: accuracy, fluency: 80, completeness: 100, json: wordsJson(accuracy, 80), ...extra,
});

const LETTERS = LEGACY_LETTERS.map((letter) => letter.referenceText);

beforeAll(() => {
  vi.stubGlobal("fetch", fakeFetch);
  for (const level of ["log", "info", "warn", "error"] as const) vi.spyOn(console, level).mockImplementation(() => undefined);
});
afterAll(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("legacy Masaar /api/pronunciation == Alif /api/pronunciation", () => {
  it("covers all 28 letters", () => {
    expect(LETTERS).toHaveLength(28);
  });

  it("A0: correct pronunciation → passed: true for every letter, identical to legacy", async () => {
    for (const target of LETTERS) {
      setEnv(ENV);
      masaarReply = MASAAR.ok!;
      iqraReply = iqraPhonemes(excellentPhonemes(target));
      g.__azure = recognised(target, 85);
      const result = await both(target);
      expectSame(target, result);
      expect(result.alif.body, target).toMatchObject({ passed: true, conditionEvaluation: { matchedRule: "excellent", message: RULES[target]!.excellent!.message } });
    }
  });

  it("A0: incorrect pronunciation → passed: false (retry) for every letter, identical to legacy", async () => {
    for (const target of LETTERS) {
      for (const accuracy of [30, 69]) {
        setEnv(ENV);
        masaarReply = MASAAR.ok!;
        iqraReply = iqraPhonemes(excellentPhonemes(target));
        g.__azure = recognised(target, accuracy);
        const result = await both(target);
        expectSame(`${target}@${accuracy}`, result);
        expect(result.alif.body.passed, target).toBe(false);
        expect(result.alif.body.conditionEvaluation.matchedRule, target).not.toBe("excellent");
      }
    }
  });

  it("A0: IQRA unavailable → exactly the legacy result (only ألف and ذال can pass)", async () => {
    const passing = new Set<string>();
    for (const target of LETTERS) {
      for (const [mode, reply] of Object.entries(IQRA_FAILURES)) {
        setEnv(ENV);
        masaarReply = MASAAR.ok!;
        iqraReply = reply;
        g.__azure = recognised(target, 90);
        const result = await both(target);
        expectSame(`${target} / IQRA ${mode}`, result);
        if (result.alif.body.passed && mode === "unreachable") passing.add(target);
      }
    }
    expect([...passing].sort()).toEqual(["ألف", "ذال"].sort());
  });

  it("matrix: accuracies around every threshold × first-sound scores × all rule phoneme combinations × MASAAR answers", async () => {
    const accuracies = [0, 30, 64, 64.5, 65, 66, 69, 69.4, 69.5, 70, 70.4, 71, 85, 100];
    const firstSounds = [undefined, 40, 54, 54.5, 55, 90];
    const masaarModes = Object.keys(MASAAR);
    const pool = ["b","t","f","aa","s","j","ii","m","H","h","x","AA","d","z","r","$","S","D","A","T","Z","E","a","y","g","q","k","l","n","w","*","<","i"];
    let n = 0;
    const reachedRules = new Set<string>();
    for (const target of LETTERS) {
      const tokens = phonemeTokens(target);
      const phonemeSets = [...subsets(tokens), [...tokens, "w"], ["<", "a", "l", "i", "f"], pool.filter((_, i) => (i * 7 + target.length) % 5 === 0)];
      const texts = [target, "", `${target}.`, "شيء آخر"];
      for (const accuracy of accuracies) for (const firstSound of firstSounds) for (const phonemes of phonemeSets) {
        setEnv({ ...ENV, INTERNAL_API_KEY: n % 3 === 0 ? undefined : ENV.INTERNAL_API_KEY });
        masaarReply = MASAAR[masaarModes[n % masaarModes.length]!]!;
        iqraReply = iqraPhonemes(phonemes);
        g.__azure = { reason: "Recognized", text: texts[n % 4], accuracy, pronunciation: accuracy - 3,
          fluency: n % 5 === 0 ? undefined : 90, completeness: n % 7 === 0 ? undefined : 100, json: wordsJson(accuracy, firstSound) };
        const result = await both(target);
        const label = JSON.stringify({ target, accuracy, firstSound, phonemes });
        expectSame(label, result);
        if (result.legacy.status === 200) reachedRules.add(`${target}:${result.legacy.body.conditionEvaluation.matchedRule}`);
        n++;
      }
    }
    const allRules = Object.entries(RULES).flatMap(([target, rules]) => Object.keys(rules).map((rule) => `${target}:${rule}`));
    expect(allRules.filter((rule) => !reachedRules.has(rule))).toEqual([]);
    expect(allRules).toHaveLength(74);
    expect(n).toBeGreaterThan(20_000);
  }, 180_000);

  it("Azure edge results and missing service configuration", async () => {
    for (const target of LETTERS) {
      const edge: Record<string, AzureScenario> = {
        noMatch: { reason: "NoMatch" },
        accuracyMissing: { reason: "Recognized", text: target, pronunciation: 80, json: "" },
        pronunciationMissing: { reason: "Recognized", text: target, accuracy: 80, json: "" },
        negativeAccuracy: { reason: "Recognized", text: target, accuracy: -1, pronunciation: 80, json: "" },
        nanAccuracy: { reason: "Recognized", text: target, accuracy: NaN, pronunciation: 80, json: "" },
        malformedJson: { reason: "Recognized", text: target, accuracy: 88, pronunciation: 85, json: "{not json" },
        jsonWithoutWords: { reason: "Recognized", text: target, accuracy: 88, pronunciation: 85, json: JSON.stringify({ NBest: [{}] }) },
        textMissing: { reason: "Recognized", accuracy: 88, pronunciation: 85, json: "" },
      };
      for (const [key, scenario] of Object.entries(edge)) {
        setEnv(ENV);
        masaarReply = MASAAR.ok!;
        iqraReply = iqraPhonemes(phonemeTokens(target));
        g.__azure = scenario;
        expectSame(`${target} / azure ${key}`, await both(target));
      }
      for (const [key, env] of Object.entries({ noMasaarUrl: { ...ENV, MASAAR_URL: undefined }, noIqraUrl: { ...ENV, IQRA_URL: undefined }, noModelUrls: { ...ENV, MASAAR_URL: undefined, IQRA_URL: undefined } })) {
        setEnv(env);
        masaarReply = MASAAR.ok!;
        iqraReply = iqraPhonemes(phonemeTokens(target));
        g.__azure = recognised(target, 88);
        expectSame(`${target} / ${key}`, await both(target));
      }
    }
  });

  it("documents the deliberate error-path differences (status codes and messages only)", async () => {
    setEnv(ENV);
    g.__azure = { reason: "Canceled" };
    let result = await both("باء");
    expect([result.legacy.status, result.alif.status]).toEqual([500, 502]);
    expect(result.alif.body.code).toBe("service_unavailable");

    setEnv({ ...ENV, AZURE_SPEECH_KEY: undefined });
    result = await both("باء");
    expect([result.legacy.status, result.alif.status]).toEqual([500, 503]);
    expect(result.alif.body.code).toBe("service_not_configured");

    setEnv(ENV);
    for (const [target, withAudio, code] of [["xyz", true, "invalid_target"], [null, true, "invalid_target"], ["باء", false, "invalid_audio"]] as const) {
      result = await both(target, withAudio);
      expect([result.legacy.status, result.alif.status]).toEqual([400, 400]);
      expect(result.alif.body.code).toBe(code);
      expect(result.alif.azure).toEqual([]);
    }
  });
});
