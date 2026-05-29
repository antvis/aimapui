import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

/**
 * Demo 站点构建配置（非库模式）
 * 输出到 ../../dist-site/，构建后执行 generate-static-html 脚本生成多页面 SEO HTML
 */
export default defineConfig({
  server: {
    host: 'dev.alipay.net',
    port: 5173,
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // 生产环境使用构建后的 core 包
      '@antv/aimapui': resolve(__dirname, '../core/dist/index.es.js'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  build: {
    outDir: resolve(__dirname, '../../dist-site'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
  appType: 'spa',
});
