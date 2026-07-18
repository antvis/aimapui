#!/usr/bin/env node

import { Command } from 'commander';
import packageJson from '../package.json' with { type: 'json' };
import { init } from './commands/init.js';
import { add } from './commands/add.js';
import { list } from './commands/list.js';

const program = new Command();

program
  .name('aimapui')
  .description('CLI for adding @antv/aimapui components to your project')
  .version(packageJson.version);

program
  .command('init')
  .description('Initialize your project with aimapui configuration')
  .option('-d, --dir <path>', 'Target directory for components', 'src/components/map')
  .option('-y, --yes', 'Skip confirmation prompts')
  .action(init);

program
  .command('add')
  .description('Add a component to your project')
  .argument('<components...>', 'Component names to add')
  .option('-d, --dir <path>', 'Override component directory')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('--overwrite', 'Overwrite existing files')
  .action(add);

program
  .command('list')
  .description('List all available components')
  .option('-c, --category <category>', 'Filter by category')
  .action(list);

program.parse();
