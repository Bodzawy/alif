// Stand-in for the self-hosted MASAAR and IQRA model services, used only by
// the E2E suite. It speaks the same contract Alif relies on:
//   POST /masaar/predict  multipart field "audio" (voice.wav) → { letter, confidence, top3 }
//   POST /iqra/predict    multipart field "audio" (voice.wav) → { sequence, phonemes, duration }
// and records every call so tests can assert the services were reached.
import { createServer } from "node:http";

const port = Number(process.env.MOCK_MODEL_PORT ?? 3299);
const hits = [];

createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/__hits") {
    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify(hits));
  }
  if (req.method === "POST" && req.url === "/__reset") {
    hits.length = 0;
    res.writeHead(204);
    return res.end();
  }
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200);
    return res.end("ok");
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);
  const service = req.url === "/masaar/predict" ? "MASAAR" : req.url === "/iqra/predict" ? "IQRA" : null;

  if (req.method !== "POST" || !service) {
    res.writeHead(404);
    return res.end();
  }

  const riff = body.indexOf(Buffer.from("RIFF"));
  hits.push({
    service,
    apiKey: req.headers["x-internal-api-key"] ?? null,
    hasAudioField: body.toString("latin1").includes('name="audio"; filename="voice.wav"'),
    wav: riff >= 0 ? { channels: body.readUInt16LE(riff + 22), sampleRate: body.readUInt32LE(riff + 24), bits: body.readUInt16LE(riff + 34) } : null,
    bytes: body.length,
  });

  res.writeHead(200, { "content-type": "application/json" });
  res.end(
    JSON.stringify(
      service === "MASAAR"
        ? { letter: "أ", confidence: 0.91, top3: [{ letter: "أ", confidence: 0.91 }, { letter: "ع", confidence: 0.05 }] }
        : { sequence: "< a l i f", phonemes: ["<", "a", "l", "i", "f"], duration: 0.9 }
    )
  );
}).listen(port, "127.0.0.1", () => console.log(`mock model server on ${port}`));
