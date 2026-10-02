import { defineConfig } from 'vite';

export default defineConfig({
  base: '/localstockfish/',
  publicDir: 'public',

  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },

  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },

  build: {
    target: 'es2022'
  }
});
