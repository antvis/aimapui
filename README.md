# @antv/aimapui

Schema/DSL-driven React map visualization component library powered by [L7](https://github.com/antvis/L7).

## ✨ Features

- **Schema/DSL Driven** — Declarative map configuration with JSON schema
- **React Components** — Ready-to-use React map visualization components
- **Powered by L7** — Built on top of AntV L7 for high-performance rendering
- **CLI Tool** — shadcn/ui style CLI for adding components to your project
- **TailwindCSS** — Modern styling with Tailwind v4

## 📦 Packages

| Package | Description | Version |
| --- | --- | --- |
| [@antv/aimapui](./packages/core) | Core component library | ![npm](https://img.shields.io/npm/v/@antv/aimapui) |
| [@antv/aimapui-cli](./packages/cli) | CLI for adding components | ![npm](https://img.shields.io/npm/v/@antv/aimapui-cli) |

## 🚀 Quick Start

### Install

```bash
npm install @antv/aimapui
# or
pnpm add @antv/aimapui
```

### Usage

```tsx
import { MapView } from '@antv/aimapui';
import '@antv/aimapui/style.css';

function App() {
  return <MapView schema={mapSchema} />;
}
```

### CLI (shadcn/ui style)

```bash
npx @antv/aimapui-cli add <component>
```

## 🛠 Development

```bash
# Install dependencies
pnpm install

# Start dev server (site)
pnpm dev

# Build core library
pnpm build

# Build all packages
pnpm build:all

# Run tests
pnpm test

# Type check
pnpm type-check
```

## 📁 Project Structure

```
├── packages/
│   ├── core/          # @antv/aimapui - Core component library
│   ├── cli/           # @antv/aimapui-cli - CLI tool
│   └── site/          # Documentation site
├── scripts/           # Build & release scripts
└── pnpm-workspace.yaml
```

## 📄 License

[MIT](./LICENSE)
