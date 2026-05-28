import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const DEFAULT_CONFIG = {
  $schema: 'https://aimapui.antv.vision/schema/components.json',
  style: 'tailwind',
  aliases: {
    components: 'src/components/map',
    utils: 'src/lib/map',
    hooks: 'src/hooks/map',
  },
};

interface InitOptions {
  dir?: string;
  yes?: boolean;
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

export async function init(options: InitOptions) {
  const configPath = path.resolve(process.cwd(), 'components.json');

  if (fs.existsSync(configPath) && !options.yes) {
    const answer = await prompt('components.json already exists. Overwrite? (y/N) ');
    if (answer.toLowerCase() !== 'y') {
      console.log('Aborted.');
      return;
    }
  }

  const config = { ...DEFAULT_CONFIG };

  if (options.dir) {
    config.aliases.components = options.dir;
  }

  if (!options.yes) {
    const componentsDir = await prompt(
      `Components directory (${config.aliases.components}): `,
    );
    if (componentsDir) {
      config.aliases.components = componentsDir;
    }

    const utilsDir = await prompt(`Utils directory (${config.aliases.utils}): `);
    if (utilsDir) {
      config.aliases.utils = utilsDir;
    }

    const hooksDir = await prompt(`Hooks directory (${config.aliases.hooks}): `);
    if (hooksDir) {
      config.aliases.hooks = hooksDir;
    }
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  console.log(`\n✅ Created components.json`);
  console.log(`\nYou can now add components with:`);
  console.log(`  npx aimapui add <component>`);
}
