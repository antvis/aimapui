import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

interface RegistryItem {
  name: string;
  description?: string;
  category?: string;
  files: string[];
  registryDependencies?: string[];
  dependencies?: Record<string, string>;
}

interface Registry {
  baseUrl: string;
  peerDependencies: Record<string, string>;
  dependencies: Record<string, string>;
  utils: RegistryItem[];
  components: RegistryItem[];
}

interface UserConfig {
  aliases: {
    components: string;
    utils: string;
    hooks: string;
  };
}

interface AddOptions {
  dir?: string;
  yes?: boolean;
  overwrite?: boolean;
}

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function loadRegistry(): Registry {
  // From dist/commands/ -> dist/ -> packages/cli/
  const cliDir = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
  const registryPath = path.resolve(cliDir, 'registry.json');
  return JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
}

function loadUserConfig(): UserConfig {
  const configPath = path.resolve(process.cwd(), 'components.json');
  if (!fs.existsSync(configPath)) {
    console.error('❌ components.json not found. Run `npx aimapui init` first.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

function findRegistryItem(registry: Registry, name: string): RegistryItem | undefined {
  return (
    registry.components.find((c) => c.name === name) ??
    registry.utils.find((u) => u.name === name)
  );
}

function isUtilItem(registry: Registry, name: string): boolean {
  return registry.utils.some((u) => u.name === name);
}

/** Recursively collect all dependency names (BFS) */
function collectAllDependencies(registry: Registry, componentNames: string[]): string[] {
  const resolved = new Set<string>();
  const queue = [...componentNames];

  while (queue.length > 0) {
    const name = queue.shift()!;
    if (resolved.has(name)) continue;
    resolved.add(name);

    const item = findRegistryItem(registry, name);
    if (!item) continue;

    for (const dep of item.registryDependencies ?? []) {
      if (!resolved.has(dep)) {
        queue.push(dep);
      }
    }
  }

  return Array.from(resolved);
}

/** Determine target directory for a file based on its source path and config */
function resolveTargetPath(
  sourcePath: string,
  config: UserConfig,
  overrideDir?: string,
): string {
  if (overrideDir) {
    const fileName = path.basename(sourcePath);
    return path.resolve(process.cwd(), overrideDir, fileName);
  }

  if (sourcePath.startsWith('src/hooks/')) {
    const relativePart = sourcePath.replace('src/hooks/', '');
    return path.resolve(process.cwd(), config.aliases.hooks, relativePart);
  }

  if (
    sourcePath.startsWith('src/utils/') ||
    sourcePath.startsWith('src/schema/') ||
    sourcePath.startsWith('src/core/') ||
    sourcePath.startsWith('src/context/')
  ) {
    const relativePart = sourcePath.replace('src/', '');
    return path.resolve(process.cwd(), config.aliases.utils, relativePart);
  }

  // components
  const relativePart = sourcePath.replace('src/components/', '');
  return path.resolve(process.cwd(), config.aliases.components, relativePart);
}

/** Collect all npm dependencies from resolved items */
function collectNpmDependencies(
  registry: Registry,
  resolvedNames: string[],
): Record<string, string> {
  const npmDeps: Record<string, string> = { ...registry.dependencies };

  for (const name of resolvedNames) {
    const item = findRegistryItem(registry, name);
    if (item?.dependencies) {
      Object.assign(npmDeps, item.dependencies);
    }
  }

  return npmDeps;
}

/** Copy a source file to target, rewriting import paths */
function copyFileWithRewrittenImports(
  sourceRoot: string,
  sourcePath: string,
  targetPath: string,
  config: UserConfig,
  overrideDir?: string,
) {
  const fullSourcePath = path.resolve(sourceRoot, sourcePath);
  if (!fs.existsSync(fullSourcePath)) {
    console.warn(`  ⚠️  Source file not found: ${sourcePath}`);
    return;
  }

  let content = fs.readFileSync(fullSourcePath, 'utf-8');

  // Rewrite relative imports to match the new file structure
  content = rewriteImports(content, sourcePath, config, overrideDir);

  const targetDir = path.dirname(targetPath);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(targetPath, content);
}

/** Rewrite import paths in source code to match target directory layout */
function rewriteImports(
  content: string,
  sourcePath: string,
  config: UserConfig,
  overrideDir?: string,
): string {
  // Match import/export statements with relative paths
  const importRegex = /((?:import|export)\s+.*?from\s+['"])([^'"]+)(['"])/g;

  return content.replace(importRegex, (_match, prefix, importPath, suffix) => {
    // Only process relative imports
    if (!importPath.startsWith('.')) {
      return `${prefix}${importPath}${suffix}`;
    }

    const sourceDir = path.dirname(sourcePath);
    const resolvedImportSource = path.normalize(path.join(sourceDir, importPath));

    // Add .ts/.tsx extension if missing for resolution
    const possibleExtensions = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];
    let actualImportSource = resolvedImportSource;
    for (const ext of possibleExtensions) {
      const candidate = resolvedImportSource + ext;
      if (candidate.endsWith('.ts') || candidate.endsWith('.tsx')) {
        actualImportSource = candidate;
        break;
      }
    }

    // Compute target path of the imported file
    const importTargetPath = resolveTargetPath(actualImportSource, config, overrideDir);
    const currentFileTargetPath = resolveTargetPath(sourcePath, config, overrideDir);
    const currentFileTargetDir = path.dirname(currentFileTargetPath);

    let newRelativePath = path.relative(currentFileTargetDir, importTargetPath);
    if (!newRelativePath.startsWith('.')) {
      newRelativePath = './' + newRelativePath;
    }

    // Remove extension for clean imports
    newRelativePath = newRelativePath
      .replace(/\.tsx?$/, '')
      .replace(/\/index$/, '');

    return `${prefix}${newRelativePath}${suffix}`;
  });
}

export async function add(componentNames: string[], options: AddOptions) {
  const registry = loadRegistry();
  const config = loadUserConfig();

  // Validate component names
  const invalidNames = componentNames.filter((name) => !findRegistryItem(registry, name));
  if (invalidNames.length > 0) {
    console.error(`❌ Unknown component(s): ${invalidNames.join(', ')}`);
    console.error(`Run \`npx aimapui list\` to see available components.`);
    process.exit(1);
  }

  // Resolve all dependencies
  const allNames = collectAllDependencies(registry, componentNames);

  // Separate requested vs auto-resolved dependencies
  const autoResolved = allNames.filter((n) => !componentNames.includes(n));
  if (autoResolved.length > 0) {
    console.log(`\nThe following dependencies will also be installed:`);
    for (const name of autoResolved) {
      const item = findRegistryItem(registry, name)!;
      const label = isUtilItem(registry, name) ? '(util)' : '(component)';
      console.log(`  - ${name} ${label}`);
    }
  }

  // Collect all files to copy
  const filesToCopy: Array<{ source: string; target: string; itemName: string }> = [];

  for (const name of allNames) {
    const item = findRegistryItem(registry, name)!;
    for (const file of item.files) {
      const targetPath = resolveTargetPath(file, config, options.dir);
      filesToCopy.push({ source: file, target: targetPath, itemName: name });
    }
  }

  // Check for existing files
  const existingFiles = filesToCopy.filter((f) => fs.existsSync(f.target));
  if (existingFiles.length > 0 && !options.overwrite && !options.yes) {
    console.log(`\n⚠️  The following files already exist:`);
    for (const file of existingFiles) {
      console.log(`  - ${path.relative(process.cwd(), file.target)}`);
    }
    const answer = await prompt('\nOverwrite? (y/N) ');
    if (answer.toLowerCase() !== 'y') {
      console.log('Aborted.');
      return;
    }
  }

  // Determine source root (the project's root where src/ lives)
  // From dist/commands/ -> dist/ -> packages/cli/ -> packages/ -> project root
  const cliDir = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
  const sourceRoot = path.resolve(cliDir, '..', '..');

  // Copy files
  console.log('');
  for (const file of filesToCopy) {
    copyFileWithRewrittenImports(sourceRoot, file.source, file.target, config, options.dir);
    const relativePath = path.relative(process.cwd(), file.target);
    console.log(`  ✅ ${relativePath}`);
  }

  // Collect npm deps
  const npmDeps = collectNpmDependencies(registry, allNames);
  const peerDeps = registry.peerDependencies;

  console.log(`\n📦 Required dependencies:`);
  console.log(`  npm install ${Object.entries(npmDeps).map(([k, v]) => `${k}@${v}`).join(' ')}`);

  console.log(`\n📦 Peer dependencies (ensure installed):`);
  console.log(`  npm install ${Object.entries(peerDeps).map(([k, v]) => `${k}@${v}`).join(' ')}`);

  console.log(`\n✅ Done! ${filesToCopy.length} files added.`);
}
