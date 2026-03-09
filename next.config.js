/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure static export for Vercel compatibility
  output: 'standalone',
  // Disable image optimization for static export if needed
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;