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
    port: 5174,
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // 直接引用源码，避免需要先构建对应包（CI 全新 checkout 仓库内无 dist）
      // 注意 plot 别名须在 core 之前，避免前缀歧义
      '@antv/aimapui-plot': resolve(__dirname, '../plot/src/index.ts'),
      '@antv/aimapui': resolve(__dirname, '../core/src/index.ts'),
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
