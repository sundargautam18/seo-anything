import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { installSkills, ALL_SKILLS } from '../src/installer.js';

test('installSkills creates expected folders for all agents', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'seoanything-test-'));

  try {
    await installSkills({
      targetAgent: 'all',
      targetDir: tempDir,
      isGlobal: false,
    });

    // Check Antigravity
    const agySkills = path.join(tempDir, '.agents', 'skills');
    assert.ok(fs.existsSync(agySkills), 'Antigravity skills folder should exist');
    for (const skill of ALL_SKILLS) {
      assert.ok(fs.existsSync(path.join(agySkills, skill, 'SKILL.md')), `Skill ${skill} should have SKILL.md in Antigravity`);
    }

    // Check Claude
    const claudeSkills = path.join(tempDir, '.claude', 'skills');
    assert.ok(fs.existsSync(claudeSkills), 'Claude skills folder should exist');
    assert.ok(fs.existsSync(path.join(tempDir, 'CLAUDE.md')), 'CLAUDE.md should exist');

    // Check Cursor
    const cursorRules = path.join(tempDir, '.cursor', 'rules');
    assert.ok(fs.existsSync(cursorRules), 'Cursor rules folder should exist');
    for (const skill of ALL_SKILLS) {
      assert.ok(fs.existsSync(path.join(cursorRules, `${skill}.mdc`)), `Cursor rule ${skill}.mdc should exist`);
    }

    // Check Gemini & Copilot & Windsurf & Universal
    assert.ok(fs.existsSync(path.join(tempDir, 'GEMINI.md')), 'GEMINI.md should exist');
    assert.ok(fs.existsSync(path.join(tempDir, 'AGENTS.md')), 'AGENTS.md should exist');
    assert.ok(fs.existsSync(path.join(tempDir, '.github', 'copilot-instructions.md')), 'copilot-instructions.md should exist');
    assert.ok(fs.existsSync(path.join(tempDir, '.windsurfrules')), '.windsurfrules should exist');
    assert.ok(fs.existsSync(path.join(tempDir, 'SEO.md')), 'SEO.md should exist');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
