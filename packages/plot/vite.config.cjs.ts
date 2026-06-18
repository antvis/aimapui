import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'aimapuiPlot',
      formats: ['cjs'],
      fileName: () => 'index.cjs',
    },
    rollupOptions: {
      external: [
        'react', /^react\//, 'react-dom', /^react-dom\//,
        '@antv/l7', /^@antv\/l7-/,
        '@antv/aimapui',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@antv/l7': 'L7',
          '@antv/aimapui': 'AiMapUI',
        },
      },
    },
  },
});
