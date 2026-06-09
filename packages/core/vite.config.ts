import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    host: 'dev.alipay.net',
    port: 5173,
  },
  plugins: [
    react(),
    tailwindcss(),
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
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
      formats: ['es'],
      fileName: () => 'index.es.js',
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
          'react-dom': 'ReactDOM',
          '@antv/l7': 'L7',
          '@antv/l7-maps': 'L7Maps',
        },
        assetFileNames: (assetInfo) => {
          // Vite lib build 从入口名称生成 CSS（如 aimapui.css），
          // 统一输出为 style.css，对齐 package.json exports
          if (assetInfo.names?.includes('style.css') || assetInfo.names?.includes('aimapui.css') || assetInfo.originalFileNames?.some(f => f.endsWith('.css'))) {
            return 'style.css';
          }
          return assetInfo.names?.[0] ?? 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});