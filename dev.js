import { spawn } from 'node:child_process';
import process from 'node:process';

const children = [
  spawn(process.execPath, ['server.js'], { stdio: 'inherit', env: process.env }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '0.0.0.0'], { stdio: 'inherit', env: process.env })
];
const stop = () => { for (const child of children) child.kill(); process.exit(); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
