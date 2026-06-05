import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AimapUI',
      formats: ['iife'],
      fileName: () => 'index.iife.js',
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
        '@antv/l7-maps',
        /^@antv\/l7-maps\//,
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
          'react/jsx-runtime': 'React',
          'react/jsx-dev-runtime': 'React',
          'react-dom': 'ReactDOM',
          'react-dom/client': 'ReactDOM',
          ahooks: 'ahooks',
          clsx: 'clsx',
          geotiff: 'GeoTIFF',
          supercluster: 'Supercluster',
          '@antv/l7': 'L7',
          '@antv/l7-maps': 'L7Maps',
          '@antv/l7-core': 'L7Core',
          '@antv/l7-layers': 'L7Layers',
          '@antv/l7-component': 'L7Component',
          '@antv/l7-source': 'L7Source',
          '@antv/l7-scene': 'L7Scene',
          '@antv/l7-utils': 'L7Utils',
          '@antv/l7-map': 'L7Map',
        },
        assetFileNames: (assetInfo) => {
          // CSS 产物已由 ESM 构建输出，IIFE 不需要重复输出
          if (assetInfo.names?.includes('style.css')) return 'style.css';
          return assetInfo.names?.[0] ?? 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
