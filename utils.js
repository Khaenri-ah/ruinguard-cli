import { execa } from 'execa';
import fs from 'fs/promises';

export async function npm(cwd, command, ...options) {
  return execa('npm', [ command, '--json', ...options ], { cwd }).then(res => JSON.parse(res.stdout)).catch(() => {});
}

export function config(value) {
  if (value.startsWith('\\')) return value.slice(1);
  return value.startsWith('$') ? process.env[value.slice(1)] : value;
}

export async function fileExists(filepath) {
  return fs.stat(filepath).then(() => true).catch(() => false);
}