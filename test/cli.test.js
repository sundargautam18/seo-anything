import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runCli } from '../src/cli.js';

test('runCli handles --version and list without throwing', async () => {
  // Should complete without error
  await runCli(['--version']);
  await runCli(['list']);
});

test('runCli handles schema generation without throwing', async () => {
  await runCli(['schema', 'faq']);
});
