import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const nodeOptions = process.env.NODE_OPTIONS || '';
// Localhost cookies are shared across ports. Running the ERP and several stores
// can exceed Node's default 16 KiB before Next.js can handle the auth callback.
// This override applies only to development; production limits are unchanged.
const headerOption = /--max-http-header-size(?:=|\s)/.test(nodeOptions) ? '' : ' --max-http-header-size=65536';
const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'dev', ...process.argv.slice(2)], {
  env: { ...process.env, NODE_OPTIONS: `${nodeOptions}${headerOption}`.trim(), NODE_USE_SYSTEM_CA: process.env.NODE_USE_SYSTEM_CA || '1' },
  stdio: 'inherit',
});
child.on('error', () => { console.error('Nao foi possivel iniciar a loja.'); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
