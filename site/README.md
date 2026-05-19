# aimapkit 官网

基于 Nextra (Next.js) 构建的 aimapkit 官网文档站点。

## 技术栈

- **框架**: Next.js 15+ (App Router)
- **文档引擎**: Nextra 4.x (Docs Theme)
- **地图组件**: @antv/aimapkit + @antv/l7
- **地图服务**: 高德地图
- **样式方案**: Tailwind CSS 4.x
- **部署平台**: Vercel

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build
```

## 环境变量

创建 `.env.local` 文件并配置以下变量:

```bash
NEXT_PUBLIC_AMAP_KEY=your_amap_key_here
```

## 部署

项目支持 Vercel 自动部署,只需连接 GitHub 仓库即可。

## 文档结构

- `/docs` - 文档页面
- `/examples` - 示例库
- `/components` - React 组件
- `/data` - 静态数据

## License

MIT
