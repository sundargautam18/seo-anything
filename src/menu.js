import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import path from 'node:path';
import fs from 'node:fs';
import { installSkills, ALL_SKILLS, SUPPORTED_AGENTS } from './installer.js';
import { runAudit } from './auditor.js';
import { runSchemaCli, SUPPORTED_SCHEMAS } from './schema-generator.js';
import { generateLlmsTxt } from './llms-generator.js';
import { generateSitemap } from './sitemap-generator.js';
import { colors } from './utils.js';

/**
 * Interactive CLI selection menu
 * Enables users to choose actions interactively without memorizing command names or flags.
 */
export async function runInteractiveMenu(printHelpFn, printSkillsFn) {
  const rl = readline.createInterface({ input, output });

  try {
    let running = true;
    while (running) {
      console.clear ? console.clear() : console.log('\n'.repeat(10));
      printMenuHeader();

      console.log(`\n${colors.bold}What would you like to do?${colors.reset}\n`);
      console.log(`  ${colors.green}[1]${colors.reset} 🚀 ${colors.bold}Install SEO Skills${colors.reset} for AI Agents (Cursor, Claude, Antigravity, Copilot...)`);
      console.log(`  ${colors.green}[2]${colors.reset} 🔍 ${colors.bold}Run SEO & GEO Audit${colors.reset} (Current Folder, Route/File, or Live URL)`);
      console.log(`  ${colors.green}[3]${colors.reset} 🏷️  ${colors.bold}Generate JSON-LD Schema${colors.reset} (FAQ, Article, Organization, Product...)`);
      console.log(`  ${colors.green}[4]${colors.reset} 🤖 ${colors.bold}Generate llms.txt${colors.reset} for AI Search (Perplexity, ChatGPT, ClaudeBot)`);
      console.log(`  ${colors.green}[5]${colors.reset} 🗺️  ${colors.bold}Generate XML Sitemap${colors.reset} from routes or domain`);
      console.log(`  ${colors.green}[6]${colors.reset} 📚 ${colors.bold}View Available Skills${colors.reset} (All-in-One Master & Modular Disciplines)`);
      console.log(`  ${colors.green}[7]${colors.reset} ❓ ${colors.bold}Command Reference & Help${colors.reset}`);
      console.log(`  ${colors.red}[8]${colors.reset} 🚪 ${colors.gray}Exit${colors.reset}`);

      const choice = (await rl.question(`\n${colors.cyan}Enter your choice [1-8] (default: 1): ${colors.reset}`)).trim();

      switch (choice) {
        case '1':
        case 'install':
        case 'init':
        case '': {
          await handleInstallMenu(rl);
          break;
        }

        case '2':
        case 'audit':
        case 'check': {
          await handleAuditMenu(rl);
          break;
        }

        case '3':
        case 'schema': {
          await handleSchemaMenu(rl);
          break;
        }

        case '4':
        case 'llms':
        case 'llms-txt': {
          await handleLlmsMenu(rl);
          break;
        }

        case '5':
        case 'sitemap': {
          await handleSitemapMenu(rl);
          break;
        }

        case '6':
        case 'list':
        case 'skills': {
          if (printSkillsFn) printSkillsFn();
          await pausePrompt(rl);
          break;
        }

        case '7':
        case 'help': {
          if (printHelpFn) printHelpFn();
          await pausePrompt(rl);
          break;
        }

        case '8':
        case 'exit':
        case 'q':
        case 'quit': {
          running = false;
          console.log(`\n${colors.cyan}👋 Thank you for using SEOAnything! Happy ranking.${colors.reset}\n`);
          break;
        }

        default: {
          console.log(`\n${colors.yellow}Invalid option "${choice}". Please choose 1-8.${colors.reset}`);
          await pausePrompt(rl);
        }
      }
    }
  } catch (err) {
    if (err.name === 'AbortError' || err.code === 'ERR_USE_AFTER_CLOSE') {
      console.log('\nExiting...');
    } else {
      console.error(`\n${colors.red}Error: ${err.message}${colors.reset}`);
    }
  } finally {
    rl.close();
  }
}

function printMenuHeader() {
  console.log(`
${colors.bold}${colors.blue}╔═══════════════════════════════════════════════════════════════╗
║                      SEOAnything (v1.0.0)                     ║
║   The All-in-One SEO & GEO Skill Suite for Modern AI Agents   ║
╚═══════════════════════════════════════════════════════════════╝${colors.reset}`);
}

async function pausePrompt(rl) {
  console.log('');
  await rl.question(`${colors.gray}Press Enter to return to main menu...${colors.reset}`);
}

/**
 * Submenu: Install Skills
 */
async function handleInstallMenu(rl) {
  console.log(`\n${colors.bold}${colors.blue}─── 🚀 Install SEO Skills for AI Agents ───${colors.reset}\n`);
  console.log(`Select target AI agent:`);
  console.log(`  ${colors.green}[1]${colors.reset} 🌟 All Agents (Cursor, Claude, Antigravity, Gemini, Copilot, Windsurf) [Default]`);
  console.log(`  ${colors.green}[2]${colors.reset} 🖱️  Cursor IDE (.cursor/rules/*.mdc & .cursor/skills/)`);
  console.log(`  ${colors.green}[3]${colors.reset} 🤖 Claude Code (.claude/skills/ & CLAUDE.md)`);
  console.log(`  ${colors.green}[4]${colors.reset} 🛸 Google Antigravity (.agents/skills/ & plugins/)`);
  console.log(`  ${colors.green}[5]${colors.reset} 🌐 Gemini / Universal (GEMINI.md & AGENTS.md)`);
  console.log(`  ${colors.green}[6]${colors.reset} 💻 GitHub Copilot (.github/copilot-instructions.md)`);
  console.log(`  ${colors.green}[7]${colors.reset} 🌊 Windsurf (.windsurfrules)`);
  console.log(`  ${colors.red}[0]${colors.reset} ⬅️  Cancel / Back`);

  const agentChoice = (await rl.question(`\n${colors.cyan}Select agent [0-7] (default: 1): ${colors.reset}`)).trim();
  if (agentChoice === '0') return;

  const agentMap = {
    '1': 'all',
    '': 'all',
    '2': 'cursor',
    '3': 'claude',
    '4': 'antigravity',
    '5': 'gemini',
    '6': 'copilot',
    '7': 'windsurf',
  };

  const targetAgent = agentMap[agentChoice] || 'all';

  console.log(`\nSelect installation scope:`);
  console.log(`  ${colors.green}[1]${colors.reset} 📁 Current Workspace / Project [Default]`);
  console.log(`  ${colors.green}[2]${colors.reset} 🌍 Global User Directory (~/.gemini or ~/.claude)`);

  const scopeChoice = (await rl.question(`\n${colors.cyan}Select scope [1-2] (default: 1): ${colors.reset}`)).trim();
  const isGlobal = scopeChoice === '2';

  await installSkills({
    targetAgent,
    isGlobal,
    selectedSkills: ALL_SKILLS,
  });

  await pausePrompt(rl);
}

/**
 * Submenu: Run Audit
 */
async function handleAuditMenu(rl) {
  console.log(`\n${colors.bold}${colors.blue}─── 🔍 Run SEO & GEO Audit ───${colors.reset}\n`);
  console.log(`Choose what you want to audit:`);
  console.log(`  ${colors.green}[1]${colors.reset} 📁 Current Workspace / Repository (.) [Default]`);
  console.log(`  ${colors.green}[2]${colors.reset} 📄 Specific File or Route (e.g. ./app/blog/page.tsx or index.html)`);
  console.log(`  ${colors.green}[3]${colors.reset} 🌐 Live Production URL (e.g. https://stroke.click or example.com)`);
  console.log(`  ${colors.red}[0]${colors.reset} ⬅️  Cancel / Back`);

  const targetChoice = (await rl.question(`\n${colors.cyan}Select target [0-3] (default: 1): ${colors.reset}`)).trim();
  if (targetChoice === '0') return;

  let target = '.';
  if (targetChoice === '2') {
    target = (await rl.question(`${colors.cyan}Enter relative file path [default: index.html]: ${colors.reset}`)).trim() || 'index.html';
  } else if (targetChoice === '3') {
    target = (await rl.question(`${colors.cyan}Enter website URL [e.g. https://stroke.click or example.com]: ${colors.reset}`)).trim();
    if (!target) {
      console.log(`${colors.yellow}No URL entered. Aborting audit.${colors.reset}`);
      await pausePrompt(rl);
      return;
    }
  }

  await runAudit(target, {});
  await pausePrompt(rl);
}

/**
 * Submenu: Generate JSON-LD Schema
 */
async function handleSchemaMenu(rl) {
  console.log(`\n${colors.bold}${colors.blue}─── 🏷️ Generate JSON-LD Schema ───${colors.reset}\n`);
  console.log(`Select schema type:`);
  console.log(`  ${colors.green}[1]${colors.reset} ❓ FAQPage (Rich expandable Q&A SERP dropdowns) [Default]`);
  console.log(`  ${colors.green}[2]${colors.reset} 📰 Article / BlogPosting (E-E-A-T authorship, dates & publisher)`);
  console.log(`  ${colors.green}[3]${colors.reset} 🏢 Organization (Brand entity, logo, and social sameAs links)`);
  console.log(`  ${colors.green}[4]${colors.reset} 🍞 BreadcrumbList (Clean hierarchical SERP breadcrumbs)`);
  console.log(`  ${colors.green}[5]${colors.reset} 📦 SoftwareApplication / Product (Ratings, price & offers)`);
  console.log(`  ${colors.green}[6]${colors.reset} 📋 HowTo (Step-by-step instructions & rich cards)`);
  console.log(`  ${colors.green}[7]${colors.reset} 📍 LocalBusiness (Physical address, geo & business hours)`);
  console.log(`  ${colors.red}[0]${colors.reset} ⬅️  Cancel / Back`);

  const schemaChoice = (await rl.question(`\n${colors.cyan}Select type [0-7] (default: 1): ${colors.reset}`)).trim();
  if (schemaChoice === '0') return;

  const schemaMap = {
    '1': 'faq',
    '': 'faq',
    '2': 'article',
    '3': 'organization',
    '4': 'breadcrumbs',
    '5': 'product',
    '6': 'howto',
    '7': 'local',
  };

  const schemaType = schemaMap[schemaChoice] || 'faq';

  console.log(`\nSelect output destination:`);
  console.log(`  ${colors.green}[1]${colors.reset} 💻 Print to console [Default]`);
  console.log(`  ${colors.green}[2]${colors.reset} 💾 Save to a file`);

  const destChoice = (await rl.question(`\n${colors.cyan}Select destination [1-2] (default: 1): ${colors.reset}`)).trim();
  let outFile = null;
  if (destChoice === '2') {
    outFile = (await rl.question(`${colors.cyan}Enter file path to save [default: ./public/schema.html]: ${colors.reset}`)).trim() || './public/schema.html';
  }

  runSchemaCli(schemaType, { out: outFile });
  await pausePrompt(rl);
}

/**
 * Submenu: Generate llms.txt
 */
async function handleLlmsMenu(rl) {
  console.log(`\n${colors.bold}${colors.blue}─── 🤖 Generate llms.txt for AI Search ───${colors.reset}\n`);
  console.log(`This generates an llms.txt file at your project root to maximize citations in Perplexity, ChatGPT Search, and ClaudeBot.\n`);

  // Detect default project title from package.json or folder name
  let defaultTitle = path.basename(process.cwd());
  let defaultDesc = 'Modern high-performance web application optimized for search and AI discovery.';

  try {
    const pkgPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      if (pkg.name) defaultTitle = pkg.name;
      if (pkg.description) defaultDesc = pkg.description;
    }
  } catch {}

  const title = (await rl.question(`${colors.cyan}Enter website / product name [default: ${defaultTitle}]: ${colors.reset}`)).trim() || defaultTitle;
  const description = (await rl.question(`${colors.cyan}Enter short summary [default: ${defaultDesc}]: ${colors.reset}`)).trim() || defaultDesc;

  generateLlmsTxt({ title, description });
  await pausePrompt(rl);
}

/**
 * Submenu: Generate Sitemap
 */
async function handleSitemapMenu(rl) {
  console.log(`\n${colors.bold}${colors.blue}─── 🗺️ Generate XML Sitemap ───${colors.reset}\n`);
  
  const url = (await rl.question(`${colors.cyan}Enter site base URL [default: https://example.com]: ${colors.reset}`)).trim() || 'https://example.com';

  generateSitemap(url, {});
  await pausePrompt(rl);
}
