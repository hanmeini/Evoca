import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  experimental: {
    // @ts-expect-error - Next.js types might not include this in newer versions, but Vercel NFT uses it
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
  },
};

export default nextConfig;
