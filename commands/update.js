import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml';
import ora from 'ora';

import { npm } from '../utils.js';

export default async function (modules) {
  const botPath = process.cwd();

  const config = await fs.readFile(path.resolve(botPath, 'config.yml'), 'utf-8').then(data => yaml.parse(data)).catch(() => {});
  if (!config) return ora('No bot found at this location').fail();
  const cache = await fs.readFile(path.resolve(botPath, '.ruincache'), 'utf-8').then(data => JSON.parse(data)).catch(() => ({}));

  if (!modules.length) modules = config.modules;
  const toUpdate = modules.map(m => cache[m]).filter(m => m);

  for (const module of toUpdate) {
    const spinner = ora(`Updating ${module}`).start();
    await npm(botPath, 'update', modules);
    spinner.succeed(`Updated ${module}`);
  }

  await execa('npm', ['run', 'ruin:register']);

  ora(`Updated ${modules.length} modules`).succeed();
}