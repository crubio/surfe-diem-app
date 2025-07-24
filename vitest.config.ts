import { defineConfig } from 'vitest/config'
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      providers: path.resolve(__dirname, 'src/providers'),
      lib: path.resolve(__dirname, 'src/lib'),
      routes: path.resolve(__dirname, 'src/routes'),
      config: path.resolve(__dirname, 'src/config'),
      '@features': path.resolve(__dirname, 'src/features'),
      pages: path.resolve(__dirname, 'src/pages'),
      utils: path.resolve(__dirname, 'src/utils'),
      assets: path.resolve(__dirname, 'src/assets'),
      components: path.resolve(__dirname, 'src/components'),
    },
  },
});