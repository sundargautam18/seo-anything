import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { ensureDir, copyDir, logSuccess, logInfo, logWarn, colors } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const SKILLS_SOURCE_DIR = path.join(PACKAGE_ROOT, 'skills');

export const SUPPORTED_AGENTS = ['all', 'antigravity', 'claude', 'cursor', 'gemini', 'copilot', 'windsurf', 'universal'];

export const ALL_SKILLS = [
  'seo-master',
  'seo-technical',
  'seo-keywords',
  'seo-content',
  'seo-geo',
  'seo-schema',
  'seo-links',
  'seo-programmatic',
  'seo-audit',
];

/**
 * Main install function
 */
export async function installSkills(options = {}) {
  const {
    targetAgent = 'all',
    targetDir = process.cwd(),
    isGlobal = false,
    selectedSkills = ALL_SKILLS,
  } = options;

  const baseDir = isGlobal ? os.homedir() : targetDir;
  const agentsToInstall = targetAgent === 'all' 
    ? ['antigravity', 'claude', 'cursor', 'gemini', 'copilot', 'windsurf', 'universal']
    : [targetAgent.toLowerCase()];

  console.log(`\n${colors.bold}${colors.blue}🚀 Installing SEOAnything Skills Suite${colors.reset}`);
  console.log(`${colors.gray}Target Directory: ${baseDir}${colors.reset}`);
  console.log(`${colors.gray}Target Agents:    ${agentsToInstall.join(', ')}${colors.reset}`);
  console.log(`${colors.gray}Selected Skills:  ${selectedSkills.join(', ')}\n${colors.reset}`);

  for (const agent of agentsToInstall) {
    switch (agent) {
      case 'antigravity':
        await installForAntigravity(baseDir, isGlobal, selectedSkills);
        break;
      case 'claude':
        await installForClaude(baseDir, isGlobal, selectedSkills);
        break;
      case 'cursor':
        await installForCursor(baseDir, isGlobal, selectedSkills);
        break;
      case 'gemini':
        await installForGemini(baseDir, isGlobal, selectedSkills);
        break;
      case 'copilot':
        await installForCopilot(baseDir, isGlobal, selectedSkills);
        break;
      case 'windsurf':
        await installForWindsurf(baseDir, isGlobal, selectedSkills);
        break;
      case 'universal':
        await installUniversal(baseDir, selectedSkills);
        break;
      default:
        logWarn(`Unknown agent target: ${agent}. Skipping.`);
    }
  }

  console.log(`\n${colors.bold}${colors.green}✔ SEOAnything successfully installed!${colors.reset}`);
  console.log(`${colors.cyan}Your AI agent(s) now have access to comprehensive SEO & GEO ranking skills.${colors.reset}\n`);
}

/**
 * Install for Google Antigravity (AGY)
 * Project: .agents/skills/<skill>/SKILL.md & .agents/plugins/seoanything/
 * Global: ~/.gemini/config/skills/<skill>/SKILL.md
 */
async function installForAntigravity(baseDir, isGlobal, selectedSkills) {
  const skillsDest = isGlobal
    ? path.join(baseDir, '.gemini', 'config', 'skills')
    : path.join(baseDir, '.agents', 'skills');

  ensureDir(skillsDest);

  for (const skill of selectedSkills) {
    const src = path.join(SKILLS_SOURCE_DIR, skill);
    const dest = path.join(skillsDest, skill);
    if (fs.existsSync(src)) {
      copyDir(src, dest);
    }
  }

  // If local workspace, register plugin
  if (!isGlobal) {
    const pluginDir = path.join(baseDir, '.agents', 'plugins', 'seoanything');
    ensureDir(pluginDir);
    const pluginManifest = {
      name: "seoanything",
      version: "1.0.0",
      description: "Complete SEO and GEO capabilities for Antigravity AI agents."
    };
    fs.writeFileSync(path.join(pluginDir, 'plugin.json'), JSON.stringify(pluginManifest, null, 2), 'utf-8');
  }

  logSuccess(`Antigravity: Installed ${selectedSkills.length} skills to ${skillsDest}`);
}

/**
 * Install for Claude Code / Claude Desktop
 * Project: .claude/skills/<skill>/SKILL.md and CLAUDE.md
 * Global: ~/.claude/skills/<skill>/SKILL.md
 */
async function installForClaude(baseDir, isGlobal, selectedSkills) {
  const skillsDest = path.join(baseDir, '.claude', 'skills');
  ensureDir(skillsDest);

  for (const skill of selectedSkills) {
    const src = path.join(SKILLS_SOURCE_DIR, skill);
    const dest = path.join(skillsDest, skill);
    if (fs.existsSync(src)) {
      copyDir(src, dest);
    }
  }

  // Update or create CLAUDE.md
  const claudeMdPath = path.join(baseDir, 'CLAUDE.md');
  const seoSection = `
## SEO & Generative Engine Optimization (SEOAnything)
This repository is equipped with the **SEOAnything** skill suite.
When creating web pages, writing content, or optimizing architecture:
- Run \`npx seoanything audit .\` to verify technical health, Core Web Vitals, and meta tags.
- Apply **BLUF (Bottom Line Up Front)** formatting: Answer user queries directly in the first 2 sentences.
- Use the 9 available SEO skills: \`${selectedSkills.join('`, `')}\`.
- Ensure schema markup (JSON-LD), canonical tags, and \`llms.txt\` are up to date.
`;

  if (fs.existsSync(claudeMdPath)) {
    const existing = fs.readFileSync(claudeMdPath, 'utf-8');
    if (!existing.includes('SEOAnything')) {
      fs.appendFileSync(claudeMdPath, seoSection, 'utf-8');
    }
  } else {
    fs.writeFileSync(claudeMdPath, `# Project Guidelines\n${seoSection}`, 'utf-8');
  }

  logSuccess(`Claude: Installed ${selectedSkills.length} skills to ${skillsDest} and updated CLAUDE.md`);
}

/**
 * Install for Cursor IDE
 * .cursor/rules/seo-*.mdc & .cursor/skills/
 */
async function installForCursor(baseDir, isGlobal, selectedSkills) {
  const rulesDir = path.join(baseDir, '.cursor', 'rules');
  const skillsDir = path.join(baseDir, '.cursor', 'skills');
  ensureDir(rulesDir);
  ensureDir(skillsDir);

  for (const skill of selectedSkills) {
    const src = path.join(SKILLS_SOURCE_DIR, skill);
    const skillDest = path.join(skillsDir, skill);
    if (fs.existsSync(src)) {
      copyDir(src, skillDest);
    }

    // Generate .mdc rule for Cursor
    const mdcPath = path.join(rulesDir, `${skill}.mdc`);
    const skillContentPath = path.join(src, 'SKILL.md');
    let skillText = '';
    if (fs.existsSync(skillContentPath)) {
      skillText = fs.readFileSync(skillContentPath, 'utf-8');
      // Strip frontmatter if present to reformat as Cursor MDC
      skillText = skillText.replace(/^---[\s\S]*?---/, '').trim();
    }

    const mdcContent = `---
description: "${getSkillShortDesc(skill)}"
globs: ["*.html", "*.jsx", "*.tsx", "*.vue", "*.svelte", "*.astro", "*.md", "*.mdx"]
alwaysApply: false
---

${skillText}
`;
    fs.writeFileSync(mdcPath, mdcContent, 'utf-8');
  }

  logSuccess(`Cursor: Installed ${selectedSkills.length} rules to ${rulesDir} and skills to ${skillsDir}`);
}

/**
 * Install for Gemini
 * GEMINI.md & AGENTS.md
 */
async function installForGemini(baseDir, isGlobal, selectedSkills) {
  const geminiPath = path.join(baseDir, 'GEMINI.md');
  const agentsPath = path.join(baseDir, 'AGENTS.md');

  const content = `# SEO & Search Engine Optimization Rules (SEOAnything)

This project strictly adheres to **SEOAnything** search ranking and Generative Engine Optimization (GEO) standards:

1. **Technical Foundation**:
   - Zero broken canonical tags, 301 loops, or missing viewport meta tags.
   - Core Web Vitals target: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1.
   - Every public indexable page must contain a valid self-referential canonical tag.

2. **Content & E-E-A-T (Google Helpful Content & BLUF)**:
   - Answer search intent in the opening 1-2 sentences (Bottom Line Up Front).
   - Heading hierarchy: Exactly one \`<h1>\`, logical \`<h2>\` and \`<h3>\` divisions.
   - Image optimization: Explicit width/height, WebP/AVIF format, descriptive \`alt\` tags.

3. **Generative Engine Optimization (GEO)**:
   - Optimize for AI citations (Perplexity, ChatGPT Search, Gemini, AI Overviews).
   - Maintain high statistical density (data points, metrics, benchmark percentages).
   - Maintain \`llms.txt\` at root domain.

4. **Structured Data (JSON-LD)**:
   - Implement valid JSON-LD schemas for \`Organization\`, \`Article\`, \`FAQPage\`, and \`BreadcrumbList\`.

5. **Available SEO Skills**:
${selectedSkills.map(s => `   - \`${s}\`: ${getSkillShortDesc(s)}`).join('\n')}
`;

  if (!fs.existsSync(geminiPath)) {
    fs.writeFileSync(geminiPath, content, 'utf-8');
  } else {
    const existing = fs.readFileSync(geminiPath, 'utf-8');
    if (!existing.includes('SEOAnything')) {
      fs.appendFileSync(geminiPath, `\n\n${content}`, 'utf-8');
    }
  }

  if (!fs.existsSync(agentsPath)) {
    fs.writeFileSync(agentsPath, content, 'utf-8');
  }

  logSuccess(`Gemini / AGENTS: Configured GEMINI.md and AGENTS.md`);
}

/**
 * Install for GitHub Copilot
 * .github/copilot-instructions.md
 */
async function installForCopilot(baseDir, isGlobal, selectedSkills) {
  const githubDir = path.join(baseDir, '.github');
  ensureDir(githubDir);
  const copilotFile = path.join(githubDir, 'copilot-instructions.md');

  const copilotInstructions = `
# SEO & GEO Coding Guidelines (SEOAnything)

When authoring HTML, JSX, TSX, Svelte, Vue, or Markdown files:
- Enforce strict semantic HTML: Exactly one \`<h1>\` per page. Never skip heading levels.
- Always include \`alt\` attributes on all \`<img>\` tags.
- Ensure all pages provide \`<title>\` (50–60 characters) and \`<meta name="description">\` (140–160 characters).
- Include JSON-LD Schema markup (\`<script type="application/ld+json">\`) on content and product pages.
- Format written content using BLUF (Bottom Line Up Front) to satisfy both Google and AI search models.
`;

  if (fs.existsSync(copilotFile)) {
    const existing = fs.readFileSync(copilotFile, 'utf-8');
    if (!existing.includes('SEOAnything')) {
      fs.appendFileSync(copilotFile, copilotInstructions, 'utf-8');
    }
  } else {
    fs.writeFileSync(copilotFile, copilotInstructions.trim(), 'utf-8');
  }

  logSuccess(`GitHub Copilot: Configured .github/copilot-instructions.md`);
}

/**
 * Install for Windsurf
 * .windsurfrules
 */
async function installForWindsurf(baseDir, isGlobal, selectedSkills) {
  const windsurfFile = path.join(baseDir, '.windsurfrules');
  const windsurfRules = `
# SEOAnything Guidelines
- Maintain strict technical SEO, Core Web Vitals (LCP < 2.5s, INP < 200ms), and valid JSON-LD schemas.
- Use BLUF formatting on informational pages for Generative Engine Optimization (GEO).
- Run \`npx seoanything audit .\` to validate pages.
`;

  if (fs.existsSync(windsurfFile)) {
    const existing = fs.readFileSync(windsurfFile, 'utf-8');
    if (!existing.includes('SEOAnything')) {
      fs.appendFileSync(windsurfFile, windsurfRules, 'utf-8');
    }
  } else {
    fs.writeFileSync(windsurfFile, windsurfRules.trim(), 'utf-8');
  }

  logSuccess(`Windsurf: Configured .windsurfrules`);
}

/**
 * Universal installation
 * SEO.md
 */
async function installUniversal(baseDir, selectedSkills) {
  const seoDocPath = path.join(baseDir, 'SEO.md');
  const content = `# Universal SEO & GEO Playbook (SEOAnything)

This project follows the **SEOAnything** comprehensive ranking framework for modern search and AI discovery.

## Active Skills & Runbooks
${selectedSkills.map(s => `- **\`${s}\`**: ${getSkillShortDesc(s)}`).join('\n')}

## Automated Commands
- Run site audit: \`npx seoanything audit .\`
- Generate JSON-LD schema: \`npx seoanything schema <type>\`
- Generate AI search llms.txt: \`npx seoanything llms-txt\`
- Generate XML sitemap: \`npx seoanything sitemap\`
`;

  fs.writeFileSync(seoDocPath, content, 'utf-8');
  logSuccess(`Universal: Created SEO.md in repository root`);
}

function getSkillShortDesc(skillName) {
  const map = {
    'seo-master': 'Master SEO strategy, orchestration, prioritization, and traffic drop recovery.',
    'seo-technical': 'Core Web Vitals (LCP, INP, CLS), robots.txt, sitemaps, canonicals, and SSR/SSG rendering.',
    'seo-keywords': '4-Tier search intent classification, topic clustering (Pillar-Cluster), and entity mapping.',
    'seo-content': 'BLUF answer-first writing, E-E-A-T criteria, and on-page title/meta/heading optimization.',
    'seo-geo': 'Generative Engine Optimization (GEO) for Google AI Overviews, Perplexity, and llms.txt creation.',
    'seo-schema': 'JSON-LD structured data generators and validators for rich SERP snippets.',
    'seo-links': 'Topical silo internal linking, PageRank distribution, and backlink acquisition.',
    'seo-programmatic': 'Scaled landing page generation (>60% unique data ratio) avoiding thin-content penalties.',
    'seo-audit': '100-point comprehensive SEO audit checklist and automated issue scanner.',
  };
  return map[skillName] || 'Comprehensive SEO optimization skill.';
}
