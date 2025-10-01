/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Configuration pour le serveur Docker
  experimental: {
    serverComponentsExternalPackages: ['leaflet']
  }
};

module.exports = nextConfig;
