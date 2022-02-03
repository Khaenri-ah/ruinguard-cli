import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml';
import ora from 'ora';

import { npm } from '../utils.js';

export default async function () {
  let spinner = ora('Reading existing files').start();
  const botPath = process.cwd();

  const config = await fs.readFile(path.resolve(botPath, 'config.yml'), 'utf-8').then(data => yaml.parse(data)).catch(() => {});
  if (!config) return spinner.fail('No bot found at this location');

  const cache = await fs.readFile(path.resolve(botPath, '.ruincache'), 'utf-8').then(data => JSON.parse(data)).catch(() => ({}));
  const pkg = await fs.readFile(path.resolve(botPath, 'package.json'), 'utf-8').then(data => JSON.parse(data)).catch(() => {})
  || {
    name: config.name,
    type: 'module',
  };

  spinner.text = 'Creating runtime files';

  pkg.scripts ??= {};
  pkg.scripts['ruin:run'] = 'node run.mjs start';
  pkg.scripts['ruin:register'] = 'node run.mjs register';

  await fs.writeFile(path.resolve(botPath, 'package.json'), JSON.stringify(pkg), 'utf-8');
  await fs.writeFile(path.resolve(botPath, 'run.mjs'), `import '@ruinguard/runner';`, 'utf-8');

  spinner.succeed('Created runtime files');
  spinner = ora('Installing missing modules').start();

  if (!pkg.dependencies) pkg.dependencies = {};
  if (!('@ruinguard/runner' in pkg.dependencies)) await npm(botPath, 'install', '../runner');
  for (const module of config.modules.concat('@ruinguard/runner')) {
    spinner.text = `Installing ${module}`;
    const actual = cache[module] || await npm(botPath, 'pack', '--dry-run', module).then(data => data[0]?.name);
    if (!actual) continue;
    if (!(actual in pkg.dependencies)) await npm(botPath, 'install', module);
    cache[module] = actual;
  }

  spinner.succeed('Installed missing modules');
}
