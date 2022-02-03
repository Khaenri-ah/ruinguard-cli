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

  for (const module of modules) {
    const spinner = ora(`Uninstalling ${module}`).start();
    const actual = Object.entries(cache).find(([, value]) => value === module)?.[0] || module;
    config.modules = config.modules.filter(m => m !== actual);
    await npm('uninstall', module);
    delete cache[actual];
    spinner.succeed(`Uninstalled ${module}`);
  }

  await fs.writeFile(path.resolve(botPath, 'config.yml'), yaml.stringify(config), 'utf-8');
  await fs.writeFile(path.resolve(botPath, '.ruincache'), JSON.stringify(cache), 'utf-8');

  ora(`Uninstalled ${modules.length} modules`).succeed();
}