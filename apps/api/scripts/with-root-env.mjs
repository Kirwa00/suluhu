#!/usr/bin/env node
// Runs a command with the repo-root `.env` loaded. The Prisma CLI only picks up
// a `.env` next to the schema or in the cwd, while this monorepo keeps a single
// `.env` at the root (see AppConfigModule). Existing environment variables win,
// and a missing file is fine — CI passes the variables directly.
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const rootEnv = resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env');

function parse(contents) {
  const vars = {};
  for (const line of contents.split('\n')) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    const [, key, rawValue] = match;
    const value = rawValue.trim();
    const quote = value[0] === '"' || value[0] === "'" ? value[0] : null;
    vars[key] =
      quote && value.endsWith(quote) && value.length > 1
        ? value.slice(1, -1)
        : value.replace(/\s+#.*$/, '').trim();
  }
  return vars;
}

let loaded = {};
try {
  loaded = parse(readFileSync(rootEnv, 'utf8'));
} catch (err) {
  if (err.code !== 'ENOENT') throw err;
}

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error('usage: with-root-env.mjs <command> [args...]');
  process.exit(1);
}

const child = spawn(command, args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...loaded, ...process.env },
});
child.on('exit', (code, signal) => process.exit(signal ? 1 : (code ?? 1)));
child.on('error', (err) => {
  console.error(err.message);
  process.exit(1);
});
