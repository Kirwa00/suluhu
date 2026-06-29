import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Compile the workspace packages from source rather than their prebuilt CJS,
  // so the dev React-Refresh transform operates on real ES modules.
  transpilePackages: ['@suluhu/shared', '@suluhu/ui'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@suluhu/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    };
    return config;
  },
};

export default nextConfig;
