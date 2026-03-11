import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  outputFileTracingIncludes: {
    '/api/**/*': [
      './node_modules/pdf-parse/dist/**/*.mjs',
      './node_modules/pdf-parse/dist/**/*.cjs',
      './node_modules/pdf-parse/dist/**/*.js'
    ],
    'app/api/**/*': [
      './node_modules/pdf-parse/dist/**/*.mjs',
      './node_modules/pdf-parse/dist/**/*.cjs',
      './node_modules/pdf-parse/dist/**/*.js'
    ],
  },
};

export default nextConfig;
