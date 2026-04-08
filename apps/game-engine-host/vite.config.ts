import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/game-engine-host',
  plugins: [react()],
  resolve: {
    alias: {
      '@game-engine/types': resolve(__dirname, '../../libs/shared/types/src/index.ts'),
      '@game-engine/utils': resolve(__dirname, '../../libs/shared/utils/src/index.ts'),
      '@game-engine/session': resolve(__dirname, '../../libs/shared/services/session/src/index.ts'),
      '@game-engine/resource': resolve(__dirname, '../../libs/shared/services/resource/src/index.ts'),
      '@game-engine/claude': resolve(__dirname, '../../libs/shared/services/claude/src/index.ts'),
      '@game-engine/ui': resolve(__dirname, '../../libs/shared/ui/src/index.ts'),
      '@game-engine/black-box': resolve(__dirname, '../../libs/games/black-box/src/index.ts'),
    },
  },
  server: {
    port: 4200,
    host: 'localhost',
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
  },
});
