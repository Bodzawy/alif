/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: false },
  // Webpack-bundling the Azure Speech SDK breaks its runtime transport
  // detection: every pronunciation assessment then gets canceled by Azure in
  // production while the same code works under plain Node. Keeping it
  // external avoids that (same fix as in the original pronunciation system).
  serverExternalPackages: ["microsoft-cognitiveservices-speech-sdk"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          // The microphone is only ever requested by Alif itself.
          { key: "Permissions-Policy", value: "microphone=(self), camera=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
