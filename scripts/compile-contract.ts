import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const source = resolve('contracts/escrow.compact');
const output = resolve('contracts/managed/escrow');

function run(command: string, args: string[]): void {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (!existsSync(source)) throw new Error(`Contract source not found: ${source}`);

if (process.platform === 'win32') {
  // Midnight supports Windows development through WSL. The command deliberately
  // uses the active WSL user's PATH, rather than hard-coding a user profile.
  const wslSource = `/mnt/${source[0].toLowerCase()}${source.slice(2).replaceAll('\\', '/')}`;
  const wslOutput = `/mnt/${output[0].toLowerCase()}${output.slice(2).replaceAll('\\', '/')}`;
  const distribution = process.env.MIDNIGHT_WSL_DISTRO ?? 'Ubuntu';
  run('wsl', ['-d', distribution, '--', 'bash', '-lc', `export PATH=\"$HOME/.local/bin:$PATH\"; compact compile '${wslSource}' '${wslOutput}'`]);
} else {
  run('compact', ['compile', source, output]);
}
