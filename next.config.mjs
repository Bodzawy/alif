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
  async redirects() {
    return [
      // The vocabulary lessons moved: /a0/lesson-1 → /a1/lesson-N → /a0/words/lesson-N.
      // Temporary (307) on purpose: A1 is a new curriculum that reuses /a1/lesson-N.
      // Old /a1/lesson-N URLs without an A1 lesson of that slug are redirected by
      // src/app/a1/[lesson]/page.tsx; A1 lessons have no /intro page.
      { source: "/a0/lesson-1", destination: "/a0/words/lesson-1", permanent: false },
      { source: "/a1/:lesson(lesson-\\d+)/intro", destination: "/a0/words/:lesson/intro", permanent: false },
    ];
  },
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
