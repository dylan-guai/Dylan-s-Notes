/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note images in Notion page bodies are rendered as plain <img> from Markdown,
  // so no next/image remote-host allowlist is needed for v1. Notion image URLs
  // expire (~1h); ISR re-fetches them on each revalidation. See CLAUDE.md.
  reactStrictMode: true,
};

export default nextConfig;
