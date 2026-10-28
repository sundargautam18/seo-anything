#!/usr/bin/env node

import { runCli } from '../src/cli.js';

runCli().catch((err) => {
  console.error('\x1b[31m✖ Fatal Error:\x1b[0m', err.message || err);
  process.exit(1);
});
