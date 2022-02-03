import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml';
import ora from 'ora';

import { fileExists } from '../utils.js';
import repair from './repair.js';

export default async function (name, guild = null, options = {}) {
  const spinner = ora('Creating initial files').start();
  name = name.replace(/[\W]+/g, '-');
  const botPath = path.resolve(options.path || name);

  if (!await fileExists(botPath)) await fs.mkdir(botPath, { recursive: true });

  await fs.writeFile(path.resolve(botPath, 'config.yml'), yaml.stringify({
    name, guild,
    clientID: '$CLIENTID',
    token: '$TOKEN',
    modules: [],
  }), 'utf-8');

  await fs.writeFile(path.resolve(botPath, '.env'), 'TOKEN=\nCLIENTID=', 'utf-8');

  spinner.succeed('Created initial files');

  await repair();

  ora(`Created ${name}`).succeed();
}

