import { azureConfig, internalApiKey, iqraUrl } from "@/lib/pronunciation/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Deployment check: reports which services are configured – never the values.
export async function GET() {
  const services = {
    azureSpeech: azureConfig() !== null,
    iqra: Boolean(iqraUrl()),
    internalApiKey: Boolean(internalApiKey()),
  };
  return Response.json(
    { status: services.azureSpeech ? "ok" : "degraded", services },
    { headers: { "Cache-Control": "no-store" } }
  );
}
