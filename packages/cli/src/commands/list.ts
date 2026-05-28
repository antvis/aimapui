import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

interface RegistryComponent {
  name: string;
  description: string;
  category: string;
  files: string[];
  registryDependencies?: string[];
  dependencies?: Record<string, string>;
}

interface Registry {
  components: RegistryComponent[];
}

interface ListOptions {
  category?: string;
}

function loadRegistry(): Registry {
  // From dist/commands/ -> dist/ -> packages/cli/
  const cliDir = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
  const registryPath = path.resolve(cliDir, 'registry.json');
  return JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
}

export async function list(options: ListOptions) {
  const registry = loadRegistry();
  let components = registry.components;

  if (options.category) {
    components = components.filter(
      (c) => c.category === options.category,
    );
  }

  if (components.length === 0) {
    console.log('No components found.');
    return;
  }

  const categories = new Map<string, RegistryComponent[]>();
  for (const component of components) {
    const group = categories.get(component.category) ?? [];
    group.push(component);
    categories.set(component.category, group);
  }

  const categoryLabels: Record<string, string> = {
    core: '🗺️  Core',
    layer: '📍 Layers',
    composite: '🧩 Composite Layers',
    interaction: '💬 Interaction',
    control: '🎛️  Controls',
    legend: '📊 Legends',
  };

  for (const [category, items] of categories) {
    const label = categoryLabels[category] ?? category;
    console.log(`\n${label}`);
    console.log('─'.repeat(40));
    for (const item of items) {
      const depCount = item.registryDependencies?.length ?? 0;
      const depInfo = depCount > 0 ? ` (deps: ${depCount})` : '';
      console.log(`  ${item.name.padEnd(24)} ${item.description}${depInfo}`);
    }
  }

  console.log(`\nTotal: ${components.length} components`);
  console.log(`\nUsage: npx aimapui add <component>`);
}
