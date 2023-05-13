/**
 * Importing npm packages.
 */
import image from '@astrojs/image';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';
import { defineConfig } from 'astro/config';

/**
 * Importing user defined packages.
 */

/**
 * Declaring the constants.
 */

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [tailwind(), image()],
  experimental: { middleware: true },
  vite: {
    server: {
      proxy: {
        '/graphql': {
          target: 'https://archive.dev.shadow-apps.com/graphql/accounts',
          changeOrigin: true,
          secure: false,
          rewrite: () => '',
          headers: { service: 'Local Accounts Setup' },
        },
      },
    },
  },
});
