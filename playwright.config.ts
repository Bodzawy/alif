import { defineConfig } from "@playwright/test";

// E2E against production builds (`npm run build` first).
//
// Two local servers are started:
//   :3210  Alif with NO service configuration (frontend flow + error handling)
//   :3211  Alif configured with Azure credentials from the environment (or a
//          deliberately invalid key) and MASAAR/IQRA pointed at a local
//          stand-in (e2e/support/mock-model-server.mjs)
//
// To run the real full chain against a deployment with real services:
//   ALIF_E2E_LIVE_URL=https://alif.example.com ALIF_E2E_FAKE_AUDIO=/path/alif.wav npx playwright test live
const fakeAudio = process.env.ALIF_E2E_FAKE_AUDIO;
const chromiumPath = process.env.ALIF_E2E_CHROMIUM ?? (process.env.PLAYWRIGHT_BROWSERS_PATH === "/opt/pw-browsers" ? "/opt/pw-browsers/chromium" : undefined);

export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:3210",
    permissions: ["microphone"],
    trace: "retain-on-failure",
    launchOptions: {
      executablePath: chromiumPath,
      args: [
        "--use-fake-ui-for-media-stream",
        "--use-fake-device-for-media-stream",
        "--autoplay-policy=no-user-gesture-required",
        ...(fakeAudio ? [`--use-file-for-fake-audio-capture=${fakeAudio}`] : []),
      ],
    },
  },
  webServer: process.env.ALIF_E2E_LIVE_URL
    ? undefined
    : [
        {
          command: "node e2e/support/mock-model-server.mjs",
          url: "http://127.0.0.1:3299/",
          reuseExistingServer: false,
          env: { MOCK_MODEL_PORT: "3299" },
        },
        {
          command: "npx next start -p 3210 -H 127.0.0.1",
          url: "http://127.0.0.1:3210/",
          reuseExistingServer: false,
          env: { AZURE_SPEECH_KEY: "", AZURE_SPEECH_REGION: "", MASAAR_URL: "", IQRA_URL: "", INTERNAL_API_KEY: "" },
        },
        {
          command: "npx next start -p 3211 -H 127.0.0.1",
          url: "http://127.0.0.1:3211/",
          reuseExistingServer: false,
          env: {
            AZURE_SPEECH_KEY: process.env.ALIF_E2E_AZURE_KEY ?? "e2e-invalid-key",
            AZURE_SPEECH_REGION: process.env.ALIF_E2E_AZURE_REGION ?? "germanywestcentral",
            MASAAR_URL: "http://127.0.0.1:3299/masaar",
            IQRA_URL: "http://127.0.0.1:3299/iqra",
            INTERNAL_API_KEY: "e2e-internal-key",
          },
        },
      ],
});
