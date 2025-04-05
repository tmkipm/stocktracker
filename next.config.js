/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['www.example.com'], // Add domains for stock images if needed
    unoptimized: true, // Required for static export
  },
  output: 'export', // Enable static HTML export
  // GitHub Pages adds a trailing slash, so we need to ensure our paths work with it
  trailingSlash: true,
}

module.exports = nextConfig 