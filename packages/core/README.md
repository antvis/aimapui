# @antv/aimapui

Schema/DSL-driven React map visualization component library powered by [L7](https://github.com/antvis/L7).

## Features

- **Schema/DSL Driven** — Declarative map configuration with JSON schema
- **React Components** — Ready-to-use React map visualization components
- **Powered by L7** — Built on top of AntV L7 for high-performance rendering
- **TailwindCSS** — Modern styling with Tailwind v4

## Install

```bash
npm install @antv/aimapui
# or
pnpm add @antv/aimapui
```

## Usage

```tsx
import { AiMap } from '@antv/aimapui';
import '@antv/aimapui/style.css';

function App() {
  return <AiMap schema={mapSchema} />;
}
```

## CLI (shadcn/ui style)

```bash
npx @antv/aimapui-cli add <component>
```

## License

[MIT](https://github.com/antvis/aimapui/blob/main/LICENSE)
