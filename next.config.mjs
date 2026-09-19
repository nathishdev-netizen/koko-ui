/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Quality gates stay ON. The legacy build disabled both, which is how it
  // shipped type errors and dead schema to production.
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },

  images: {
    formats: ['image/avif', 'image/webp'],
    // Legacy catalogue media still lives on Wix CDN until assets migrate.
    remotePatterns: [
      // Legacy catalogue + editorial media, until assets migrate to our own CDN.
      { protocol: 'https', hostname: 'static.wixstatic.com' },
      { protocol: 'https', hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com' },
    ],
  },

  // Legacy URL generations are 301 redirects, never rewrites. A rewrite serves
  // 200 OK at the old path and Google re-indexes it — that regression is
  // documented in REBUILD_ANALYSIS.md 3.2 and must not recur.
  async redirects() {
    return [];
  },
};

export default nextConfig;
