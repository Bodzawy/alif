import "server-only";

// Server-side service configuration. Read at request time so a deployment
// can change environment variables without a rebuild. Never import this
// module from client components.

export type AzureConfig = { key: string; region: string };

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function azureConfig(): AzureConfig | null {
  const key = clean(process.env.AZURE_SPEECH_KEY);
  const region = clean(process.env.AZURE_SPEECH_REGION);
  return key && region ? { key, region } : null;
}

/** Base URL without trailing slash and without the /predict suffix. */
function serviceUrl(value: string | undefined): string | undefined {
  return clean(value)?.replace(/\/+$/, "");
}

export function masaarUrl(): string | undefined {
  return serviceUrl(process.env.MASAAR_URL);
}

export function iqraUrl(): string | undefined {
  return serviceUrl(process.env.IQRA_URL);
}

export function internalApiKey(): string | undefined {
  return clean(process.env.INTERNAL_API_KEY);
}
