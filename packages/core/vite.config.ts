import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { nodeResolve } from '@rollup/plugin-node-resolve';

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
    nodeResolve({
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  build: {
    emptyOutDir: false, // 不清空输出目录
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'aimapui',
      formats: ['es'],
      fileName: () => 'index.es.js',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@antv/l7',
        /^@antv\/l7-maps\//,   // 子路径按需导入: @antv/l7-maps/gaode, /mapbox, etc.
        '@antv/l7-maps',
        '@antv/l7-core',
        /^@antv\/l7-core\//,
        '@antv/l7-layers',
        /^@antv\/l7-layers\//,
        '@antv/l7-component',
        /^@antv\/l7-component\//,
        '@antv/l7-source',
        /^@antv\/l7-source\//,
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@antv/l7': 'L7',
          '@antv/l7-maps': 'L7Maps',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.includes('style.css')) return 'style.css';
          return assetInfo.names?.[0] ?? 'assets/[name]-[hash][extname]';
        },
      },
    },
    commonjsOptions: {
      extensions: ['.js', '.ts', '.tsx'],
    },
  },
});