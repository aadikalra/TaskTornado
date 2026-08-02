import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // This app is nested inside another JavaScript project. Pin Next.js to this
  // directory so Turbopack does not select the parent package-lock as its root.
  outputFileTracingRoot: projectRoot,
  allowedDevOrigins: ['192.168.1.105'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  
  turbopack: {
    root: projectRoot,
  },
  
  // Enable bundle analyzer in development
  ...(process.env.ANALYZE === 'true' && {
    experimental: {
      bundleAnalyzer: true,
    },
  }),

  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'motion',
      'date-fns',
      'canvas-confetti',
      'katex',
      'react-syntax-highlighter',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-context-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group',
      '@radix-ui/react-toolbar',
      '@radix-ui/react-tooltip',
      '@platejs/ai',
      '@platejs/basic-nodes',
      '@platejs/basic-styles',
      '@platejs/code-block',
      '@platejs/list',
      '@platejs/table',
      '@platejs/link',
      '@platejs/media',
      '@platejs/mention',
      '@platejs/emoji',
      '@platejs/markdown',
      '@platejs/dnd',
      '@platejs/selection',
      'platejs',
    ],
  },

  // Webpack optimizations (keep for fallback)
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for node_modules
            vendor: {
              name: 'vendors',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk for shared utilities
            common: {
              name: 'commons',
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }

    // Tree shaking optimizations
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;

    return config;
  },

  // Headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
