import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { fileURLToPath } from 'node:url';

const file = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default defineConfig({
  root: file('./pages-static'),
  publicDir: file('./public'),
  base: `${basePath}/`,
  plugins: [react()],
  resolve: {
    alias: {
      'next/link': file('./pages-static/link.tsx'),
      'next/dynamic': file('./pages-static/dynamic.tsx'),
      '@': file('./'),
    },
  },
  define: { 'process.env.NEXT_PUBLIC_BASE_PATH': JSON.stringify(basePath) },
  css: { postcss: { plugins: [tailwindcss()] } },
  build: {
    outDir: file('./out'),
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        home: file('./pages-static/index.html'),
        en: file('./pages-static/en/index.html'),
        korea: file('./pages-static/korea/index.html'),
      },
    },
  },
});
