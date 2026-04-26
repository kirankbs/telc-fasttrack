import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Resolve @fastrack/* from the worktree's packages so tests see the
      // updated catalog (hasContent field) without depending on the pnpm
      // workspace symlinks, which point at the main worktree's packages.
      '@fastrack/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
      '@fastrack/config': path.resolve(__dirname, '../../packages/config/src/index.ts'),
      '@fastrack/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@fastrack/content': path.resolve(__dirname, '../../packages/content/src/index.ts'),
    },
  },
});
