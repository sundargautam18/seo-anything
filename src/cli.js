import { installSkills, ALL_SKILLS, SUPPORTED_AGENTS } from './installer.js';
import { runAudit } from './auditor.js';
import { runSchemaCli, SUPPORTED_SCHEMAS } from './schema-generator.js';
import { generateLlmsTxt } from './llms-generator.js';
import { generateSitemap } from './sitemap-generator.js';
import { runInteractiveMenu } from './menu.js';
import { colors } from './utils.js';

export async function runCli(args = process.argv.slice(2)) {
  // If run with no arguments, launch the user-friendly interactive menu in interactive environments
  if (args.length === 0) {
    if (process.stdin.isTTY) {
      await runInteractiveMenu(printHelp, printSkillsList);
      return;
    } else {
      printHelp();
      return;
    }
  }

  const command = args[0] ? args[0].toLowerCase() : 'help';
  const restArgs = args.slice(1);

  // Parse flags
  const flags = {};
  const positional = [];
  for (let i = 0; i < restArgs.length; i++) {
    const arg = restArgs[i];
    if (arg.startsWith('--')) {
      const parts = arg.slice(2).split('=');
      const key = parts[0];
      const val = parts.length > 1 ? parts[1] : (restArgs[i + 1] && !restArgs[i + 1].startsWith('-') ? restArgs[++i] : true);
      flags[key] = val;
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      const val = (restArgs[i + 1] && !restArgs[i + 1].startsWith('-')) ? restArgs[++i] : true;
      flags[key] = val;
    } else {
      positional.push(arg);
    }
  }

  if (flags.v || flags.version || command === '-v' || command === '--version') {
    console.log('seoanything v1.0.0');
    return;
  }

  if (flags.i || flags.interactive || command === 'interactive' || command === 'menu') {
    await runInteractiveMenu(printHelp, printSkillsList);
    return;
  }

  if (flags.h || flags.help || command === 'help' || command === '--help') {
    printHelp();
    return;
  }

  switch (command) {
    case 'init':
    case 'install': {
      const targetAgent = flags.agent || flags.a || 'all';
      const isGlobal = !!(flags.global || flags.g);
      const skillFilter = flags.skill ? [flags.skill] : ALL_SKILLS;
      await installSkills({
        targetAgent,
        isGlobal,
        selectedSkills: skillFilter,
      });
      break;
    }

    case 'audit':
    case 'check': {
      const target = positional[0] || '.';
      await runAudit(target, flags);
      break;
    }

    case 'schema': {
      const type = positional[0] || flags.type || 'article';
      runSchemaCli(type, flags);
      break;
    }

    case 'llms-txt':
    case 'llms': {
      generateLlmsTxt({
        title: flags.title,
        description: flags.description,
        contact: flags.contact,
      });
      break;
    }

    case 'sitemap': {
      const baseUrl = positional[0] || flags.url || 'https://example.com';
      generateSitemap(baseUrl, flags);
      break;
    }

    case 'list': {
      printSkillsList();
      break;
    }

    default:
      console.log(`${colors.red}Unknown command: "${command}"${colors.reset}\n`);
      printHelp();
      process.exitCode = 1;
  }
}

function printHelp() {
  console.log(`
${colors.bold}${colors.blue}╔═══════════════════════════════════════════════════════════════╗
║                      SEOAnything (v1.0.0)                     ║
║   The All-in-One SEO & GEO Skill Suite for Modern AI Agents   ║
╚═══════════════════════════════════════════════════════════════╝${colors.reset}

${colors.bold}USAGE:${colors.reset}
  npx seoanything <command> [options]

${colors.bold}COMMANDS:${colors.reset}
  ${colors.green}menu / interactive${colors.reset} Launch interactive menu to choose actions visually
  ${colors.green}init / install${colors.reset}     Install SEO skills into your agent or repository
  ${colors.green}audit [path|url]${colors.reset}   Audit technical SEO, meta tags, and GEO readiness
  ${colors.green}schema <type>${colors.reset}      Generate valid JSON-LD structured data
  ${colors.green}llms-txt${colors.reset}           Generate llms.txt for AI search engines (Perplexity, GPT)
  ${colors.green}sitemap [url]${colors.reset}      Generate an XML sitemap from pages
  ${colors.green}list${colors.reset}               List all available SEO skills and their roles

${colors.bold}INSTALL OPTIONS:${colors.reset}
  --agent, -a <name>   Target agent: ${SUPPORTED_AGENTS.join(' | ')} (default: all)
  --global, -g         Install globally to ~/.gemini or ~/.claude
  --skill <name>       Install a specific skill only

${colors.bold}SCHEMA TYPES:${colors.reset}
  ${SUPPORTED_SCHEMAS.join(', ')}

${colors.bold}EXAMPLES:${colors.reset}
  ${colors.gray}# Launch the user-friendly interactive menu (recommended):${colors.reset}
  npx seoanything


  ${colors.gray}# Install specifically for Cursor IDE rules:${colors.reset}
  npx seoanything init --agent=cursor

  ${colors.gray}# Audit current project directory:${colors.reset}
  npx seoanything audit .

  ${colors.gray}# Audit a live production page:${colors.reset}
  npx seoanything audit https://example.com/blog/my-post

  ${colors.gray}# Generate FAQPage JSON-LD schema:${colors.reset}
  npx seoanything schema faq

  ${colors.gray}# Generate llms.txt for Perplexity & AI Overviews:${colors.reset}
  npx seoanything llms-txt
`);
}

function printSkillsList() {
  console.log(`\n${colors.bold}${colors.blue}📚 Available SEOAnything Skills (9 Core Disciplines):${colors.reset}\n`);
  for (const s of ALL_SKILLS) {
    console.log(`  ${colors.green}• ${colors.bold}${s.padEnd(20)}${colors.reset}`);
  }
  console.log(`\nRun ${colors.cyan}npx seoanything init${colors.reset} to equip your AI agent with all 9 skills.\n`);
}
