#!/usr/bin/env node
import { program } from 'commander';

import create from './commands/create.js';
import repair from './commands/repair.js';
import update from './commands/update.js';
import install from './commands/install.js';
import uninstall from './commands/uninstall.js';

program.version('1.0.0-dev', '-v --version');

program
  .command('create')
  .description('create a new RuinGuard bot')
  .argument('<name>', 'the name your bot should have')
  .argument('[guild]', 'the ID of your guild, if intended for use in one specific guild')
  .option('-p --path <path>', 'override the location to create the new bot in')
  .action(create);

program
  .command('repair')
  .description('repair a RuinGuard bot. The only file required to be intact is `config.yml`')
  .action(repair);

program
  .command('install')
  .description('install a module')
  .argument('<modules...>', 'the modules you want to install')
  .action(install);

program
  .command('update')
  .description('update installed modules')
  .argument('[modules...]')
  .action(update);

program
  .command('uninstall')
  .description('uninstall a module')
  .argument('<modules...>', 'the modules you want to uninstall')
  .action(uninstall);

program.parseAsync(process.argv);