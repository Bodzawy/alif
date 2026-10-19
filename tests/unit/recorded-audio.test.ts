import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import manifest from "@/lib/tts/recorded-manifest.json";

// The recorded Arabic clips (public/audio/ar/, installed by scripts/audio/install_clips.py)
// are used by the player when the text has one; everything else is spoken by /api/tts.
describe("recorded Arabic audio", () => {
  it("maps every text to a file name <id>.<8 hex chars>", () => {
    for (const [text, file] of Object.entries(manifest.clips)) {
      expect(text.length).toBeGreaterThan(0);
      expect(file).toMatch(/^w\d{4}\.[0-9a-f]{8}$/);
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

    const [recordedText, recordedFile] = Object.entries(manifest.clips)[0]!;

    it("plays the recording instead of asking Azure", async () => {
      fetchMock.mockResolvedValue(new Response(new Blob(["x"]), { status: 200 }));
      const { speechUrl } = await import("@/lib/tts/player");
      await expect(speechUrl(recordedText)).resolves.toBe("blob:test");
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(`/audio/ar/${recordedFile}.mp3`);
    });

    it("falls back to /api/tts when the recording is not on the server", async () => {
      fetchMock.mockImplementation(async (url: string) =>
        url.startsWith("/audio/ar/") ? new Response("", { status: 404 }) : new Response(new Blob(["y"]), { status: 200 })
      );
      const { speechUrl } = await import("@/lib/tts/player");
      await expect(speechUrl(recordedText)).resolves.toBe("blob:test");
      expect(fetchMock.mock.calls.map((c) => c[0])).toEqual([`/audio/ar/${recordedFile}.mp3`, "/api/tts"]);
    });

    it("speaks texts without a recording, and dialogue voices, through /api/tts", async () => {
      fetchMock.mockImplementation(async () => new Response(new Blob(["y"]), { status: 200 }));
      const { speechUrl } = await import("@/lib/tts/player");
      await speechUrl("نَصٌّ بِلَا تَسْجِيلٍ");
      await speechUrl(recordedText, "male-1");
      expect(fetchMock.mock.calls.map((c) => c[0])).toEqual(["/api/tts", "/api/tts"]);
    });
  });
});
