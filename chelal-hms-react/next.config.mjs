import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import withBundleAnalyzer from '@next/bundle-analyzer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-easy-crop'],
  },
  webpack: (config, { dev }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': resolve(__dirname),
    }

    // Optimize bundle splitting
    if (!dev) {
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        cropper: {
          test: /[\\/]node_modules[\\/]react-easy-crop[\\/]/,
          name: 'cropper',
          chunks: 'all',
          priority: 10,
        },
      };
    }

    return config
  },
}

export default process.env.ANALYZE === 'true' ? withBundleAnalyzer()(nextConfig) : nextConfig;
