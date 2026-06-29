import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    emptyOutDir: false,
    assetsInlineLimit: 0,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'aimapui',
      formats: ['cjs'],
      fileName: () => 'index.cjs',
    },
    rollupOptions: {
      external: [
        'react',
        /^react\//,
        'react-dom',
        /^react-dom\//,
        'ahooks',
        'clsx',
        'geotiff',
        'supercluster',
        '@antv/l7',
        '@antv/l7-core',
        /^@antv\/l7-core\//,
        '@antv/l7-layers',
        /^@antv\/l7-layers\//,
        '@antv/l7-component',
        /^@antv\/l7-component\//,
        '@antv/l7-source',
        /^@antv\/l7-source\//,
        '@antv/l7-scene',
        /^@antv\/l7-scene\//,
        '@antv/l7-utils',
        /^@antv\/l7-utils\//,
        '@antv/l7-map',
        /^@antv\/l7-map\//,
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@antv/l7': 'L7',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.includes('style.css') || assetInfo.names?.includes('aimapui.css') || assetInfo.originalFileNames?.some(f => f.endsWith('.css'))) {
            return 'style.css';
          }
          return assetInfo.names?.[0] ?? 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});