import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import { resolve } from 'path';

export default defineConfig({
  plugins: [solid()],
  publicDir: false, // Don't copy public/ folder (that's Hugo's output)
  build: {
    outDir: 'static/js',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/delivery-check/index.jsx'),
      name: 'DeliveryCheck',
      fileName: () => 'delivery-check.js',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        // Ensure it's a single file with no chunk splitting
        inlineDynamicImports: true
      }
    },
    minify: 'esbuild'
  }
});
