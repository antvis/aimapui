import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({ insertTypesEntry: true, rollupTypes: true }),
  ],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'aimapuiPlot',
      formats: ['es'],
      fileName: () => 'index.es.js',
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
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.some((n: string) => n.endsWith('.css'))) return 'style.css';
          return assetInfo.names?.[0] ?? 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
