import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const rootDir = path.resolve(__dirname, '../../');

export default defineConfig({
  plugins: [react()],
  base: './',
  root: rootDir,
  css: {
    postcss: {
      plugins: [
        tailwindcss({ config: path.resolve(rootDir, 'tailwind.config.js') }),
        autoprefixer(),
      ],
    },
  },
  build: {
    outDir: path.resolve(rootDir, 'dist'),
    emptyOutDir: true,
  },
});
