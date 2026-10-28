# 🚀 SEOAnything

> **The ultimate SEO & Generative Engine Optimization (GEO) skill package for modern AI coding agents.**  
> Seamlessly equips **Cursor, Claude Code, Google Antigravity, Gemini, GitHub Copilot, Windsurf**, and any web repository with world-class search ranking intelligence.

[![npm version](https://img.shields.io/badge/npm-v1.0.0-blue.svg)](https://www.npmjs.com/package/seoanything)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](package.json)
[![GitHub Stars](https://img.shields.io/github/stars/sundargautam18/seo-anything?style=social)](https://github.com/sundargautam18/seo-anything)

---

## ⚡ Why SEOAnything?

Search has undergone a seismic shift. In 2026, ranking #1 on traditional Google blue links is only half the battle: **you must also be cited, summarized, and recommended by AI Search Engines** (Google AI Overviews, Perplexity, ChatGPT Search, Gemini, and Claude).

Most AI coding assistants lack up-to-date, specialized SEO knowledge or clutter your prompt context with bloated generic rules.

**SEOAnything** solves this by providing the **All-in-One Master Skill (`seo-master`) that covers everything across all disciplines in a single unified runbook**, plus 8 granular modular sub-skills for token-conscious workflows, alongside an automated CLI auditor, structured data generator, and multi-agent installer.

---

## 📦 Instant Setup (Zero Install Needed)

Run the zero-config interactive installer in your project root:

```bash
# Equip your repo with all 9 SEO skills across ALL detected AI agents:
npx seoanything init

# Or target a specific AI agent:
npx seoanything init --agent=cursor       # Configures .cursor/rules/*.mdc & .cursor/skills/
npx seoanything init --agent=claude       # Configures .claude/skills/ & CLAUDE.md
npx seoanything init --agent=antigravity  # Configures .agents/skills/ & plugins/
npx seoanything init --agent=gemini       # Configures GEMINI.md & AGENTS.md
npx seoanything init --agent=copilot      # Configures .github/copilot-instructions.md
```

You can also install globally or as a project dependency:

```bash
npm install -g seoanything
# Or in your project:
npm install --save-dev seoanything
```

---

## 🎯 How to Use Effectively With Your AI Agent (Zero Confusion Guide)

SEOAnything gives you **two flexible ways** to collaborate with your AI agent:

### 🌟 Mode A: The All-in-One Master Skill (`seo-master`)
> **Best for**: When you want full SEO intelligence without thinking about which specific skill to select.

The `seo-master` skill covers **everything** across all 8 disciplines (Core Web Vitals, JSON-LD schemas, BLUF writing, topical clusters, link silos, pSEO, and 100-point audits). You never have to invoke or juggle multiple specific sub-skills—just prompt with `seo-master` and your agent has the complete search ranking playbook:

```text
# Cursor IDE:
"Use @seo-master to audit our app, fix Core Web Vitals, generate valid JSON-LD schemas, and optimize headings."

# Claude Code:
> Using seo-master, conduct a complete SEO and GEO overhaul across our documentation routes.

# Google Antigravity (AGY):
"Use seo-master to optimize this workspace for search ranking, E-E-A-T, and AI citations."

# Gemini / Copilot / Windsurf:
"Follow the seo-master rules in AGENTS.md to review and optimize this landing page."
```

### 🎯 Mode B: Granular Modular Skills
> **Best for**: Laser-focused, token-efficient sub-tasks when you only need one specific discipline.

Invoke individual skills like `@seo-schema` (just for JSON-LD), `@seo-geo` (just for Perplexity / AI search), or `@seo-content` (just for writing).

---

### 1. 🖱️ Using with Cursor IDE

Cursor automatically loads `.cursor/rules/*.mdc` whenever you edit `.html`, `.jsx`, `.tsx`, `.vue`, `.svelte`, `.astro`, or `.md` files.

#### How to prompt Cursor:
You can mention the master skill `@seo-master` or specific sub-skills in the Cursor Composer (`Cmd+I` / `Ctrl+I`) or Chat (`Cmd+L` / `Ctrl+L`):

```text
# Option 1 (All-in-One): Full site overhaul without selecting specific skills
"Use @seo-master to do a complete SEO and AI Search optimization on @app/blog/[slug]/page.tsx. Fix CWV, ensure valid Article JSON-LD, apply BLUF answering, and verify canonical tags."

# Option 2 (Modular): Auditing & Fixing a Next.js Page
"Audit @app/blog/[slug]/page.tsx using seo-audit. Fix any missing canonical tags, optimize headings to have exactly one H1, and ensure the hero <Image> has the priority attribute."

# Option 3 (Modular): Writing a 100% Ranking Article
"Use @seo-content and @seo-geo to draft a 1,500-word blog post in app/blog/posts/nextjs-seo.mdx targeting 'Next.js SEO Best Practices'. Apply the BLUF inverted-pyramid answering framework, add a structured comparison table, and generate valid Article JSON-LD."

# Option 4 (Modular): Adding Structured Data
"Use @seo-schema to generate a complete FAQPage and Organization JSON-LD script for our homepage."
```

---

### 2. 🤖 Using with Claude Code / Claude Desktop

Claude Code reads your project's `CLAUDE.md` and discovers all skills in `.claude/skills/`.

#### How to prompt Claude:
In your terminal where Claude Code is active:

```bash
# Option 1 (All-in-One): Complete search strategy and execution
> Using seo-master, audit our entire web project and fix technical CWV, meta tags, and internal link silos.

# Option 2 (Modular): Run an audit and auto-fix findings
> Run `npx seoanything audit .` and fix all warnings and errors found across our routes.

# Option 3 (Modular): Create a high-converting Topic Cluster
> Based on seo-keywords, build a Pillar & Cluster topical map for our SaaS product. Give me 1 Pillar topic and 6 long-tail cluster articles with search intent classifications.

# Option 4 (Modular): AI Search (GEO) Optimization
> Review our landing page and optimize the copy for Perplexity and ChatGPT Search using the seo-geo skill. Inject verifiable benchmark data and format direct definitional soundbites.
```

---

### 3. 🛸 Using with Google Antigravity (`agy`)

Antigravity uses native **Progressive Disclosure** via `.agents/skills/<skill>/SKILL.md`. Antigravity injects the skill into context when requested.

#### How to prompt Antigravity:
```text
# Option 1 (All-in-One): End-to-end ranking intelligence
"Use seo-master to conduct a full SEO, GEO, and technical audit across this repository and fix all discovered issues."

# Option 2 (Modular): Technical SEO Audit & Fix
"Run a technical SEO audit on this workspace using seo-audit. Check Core Web Vitals, sitemaps, robots.txt, and canonicals, then output a prioritized remediation plan."

# Option 3 (Modular): Internal Linking Silos
"Use seo-links to analyze our documentation routes and design a topical silo architecture with descriptive anchor text rules and zero orphan pages."
```

---

### 4. 🌐 Using with Gemini, ChatGPT & Universal Agents

For generic LLMs, SEOAnything generates a master [`SEO.md`](SEO.md), [`GEMINI.md`](GEMINI.md), and [`AGENTS.md`](AGENTS.md) in your root directory.

#### How to prompt:
```text
"Review this page against the seo-master rules defined in AGENTS.md and SEO.md. Ensure our headings follow a strict H1 -> H2 -> H3 hierarchy, all images contain descriptive alt text, and the Core Web Vitals LCP threshold of 2.5s is satisfied."
```

---

## 🧠 The 9 Core SEO & GEO Skills

SEOAnything provides 9 production-tested skills built on the open **Agent Skills Standard (`SKILL.md`)**. You can use **`seo-master`** standalone for everything, or use individual skills for targeted tasks:

| Skill | Role / Mode | Description & Capabilities |
| :--- | :--- | :--- |
| **[`seo-master`](skills/seo-master/SKILL.md)** | 👑 **All-in-One Master Skill** | **Definitive all-in-one intelligence engine covering EVERYTHING without needing specific sub-skills.** Combines CWV, robots.txt, schemas, BLUF writing, topic silos, pSEO, GEO, and 100-point audits. |
| **[`seo-technical`](skills/seo-technical/SKILL.md)** | Modular Discipline | Core Web Vitals (LCP < 2.5s, INP < 200ms, CLS < 0.1), `robots.txt`, XML sitemaps, canonicals, redirect loops, SSR/SSG hydration traps, and hreflang. |
| **[`seo-keywords`](skills/seo-keywords/SKILL.md)** | Modular Discipline | 4-Tier Intent taxonomy (Informational, Commercial, Transactional, Navigational), Pillar-Cluster (Hub & Spoke) architecture, and entity salience. |
| **[`seo-content`](skills/seo-content/SKILL.md)** | Modular Discipline | BLUF (Bottom Line Up Front) inverted-pyramid writing, Google Helpful Content compliance, author credentials, and title/meta CTR optimization. |
| **[`seo-geo`](skills/seo-geo/SKILL.md)** | Modular Discipline | Generative Engine Optimization for Perplexity, ChatGPT Search, and Google AI Overviews. LLM passage retrieval, statistical density, and `llms.txt`. |
| **[`seo-schema`](skills/seo-schema/SKILL.md)** | Modular Discipline | JSON-LD generators and validators for `Article`, `FAQPage`, `Organization`, `BreadcrumbList`, `Product`, `HowTo`, and `SoftwareApplication`. |
| **[`seo-links`](skills/seo-links/SKILL.md)** | Modular Discipline | Topical silo design, descriptive anchor text rules, PageRank sculpting, orphan page eradication, and Digital PR outreach playbooks. |
| **[`seo-programmatic`](skills/seo-programmatic/SKILL.md)**| Modular Discipline | Safely scaling 100 to 10,000+ dynamic landing pages with >60% unique data ratio to avoid Google doorway and thin-content penalties. |
| **[`seo-audit`](skills/seo-audit/SKILL.md)** | Modular Discipline | 100-point master SEO checklist, automated CLI HTML/meta/schema scanner, and ranking drop diagnostic decision trees. |

---

## 🛠️ Built-in CLI Tooling

SEOAnything bundles zero-dependency CLI utilities with an **interactive visual selection menu** so you can pick what you want instead of typing manual commands:

### 🌟 1. Interactive Selection Menu (Zero Typing Needed!)

Simply run `seoanything` without any arguments in your terminal:

```bash
npx seoanything
# Or run:
npx seoanything menu
```

An intuitive numbered menu guides you through every capability:

```text
╔═══════════════════════════════════════════════════════════════╗
║                      SEOAnything (v1.0.0)                     ║
║   The All-in-One SEO & GEO Skill Suite for Modern AI Agents   ║
╚═══════════════════════════════════════════════════════════════╝

What would you like to do?

  [1] 🚀 Install SEO Skills for AI Agents (Cursor, Claude, Antigravity, Copilot...)
  [2] 🔍 Run SEO & GEO Audit (Current Folder, Route/File, or Live URL)
  [3] 🏷️  Generate JSON-LD Schema (FAQ, Article, Organization, Product...)
  [4] 🤖 Generate llms.txt for AI Search (Perplexity, ChatGPT, ClaudeBot)
  [5] 🗺️  Generate XML Sitemap from routes or domain
  [6] 📚 View Available Skills (All-in-One Master & Modular Disciplines)
  [7] ❓ Command Reference & Help
  [8] 🚪 Exit

Enter your choice [1-8] (default: 1): 
```

Choose your action by entering `1`, `2`, `3`... and let the interactive prompts handle the rest!

---

### 2. Automated SEO & GEO Auditor
Audit local directories, Next.js, TanStack Start, Astro, Remix, Nuxt, or live URLs (supports both `https://` and bare domain names like `stroke.click`):

```bash
# Audit current repository or any modern web app
npx seoanything audit .

# Audit a live production page (supports bare domain names)
npx seoanything audit stroke.click
npx seoanything audit https://example.com/blog/my-guide

# Audit a specific Next.js page or component
npx seoanything audit ./app/blog/[slug]/page.tsx

# Audit a specific TanStack Start route
npx seoanything audit ./src/routes/posts/$postId.tsx

# Audit a specific Astro page
npx seoanything audit ./src/pages/guide.astro

# Audit a live production page
npx seoanything audit https://example.com/blog/my-guide
```

**Comprehensive Multi-Framework Support:**
- ⚡ **Next.js (App & Pages Router)**: Parses `export const metadata`, dynamic `generateMetadata()`, `<Image priority>`, `app/robots.ts`, `app/sitemap.ts`, and `app/opengraph-image.tsx`.
- ⚡ **TanStack Start**: Parses `createFileRoute` / `createRootRoute` with `head()`, extracting `meta`, canonical `links`, OpenGraph, and JSON-LD `scripts`.
- ⚡ **Astro**: Parses `.astro` frontmatter variables, `<SEO />` component attributes, and `astro:assets` `<Image loading="eager" />` for LCP hero optimization.
- ⚡ **Remix / React Router v7**: Parses `export const meta: MetaFunction = () => [...]` (title, description, canonical link objects).
- ⚡ **Nuxt 3**: Parses `useSeoMeta()`, `useHead()`, and `<NuxtImg priority />` composables and components.
- ⚡ **SvelteKit**: Parses `<svelte:head>` blocks containing titles, descriptions, and canonical links.
- 🔍 **General Checks**: Title & Meta descriptions, single `<h1>` hierarchy, image `alt` attributes, JSON-LD schema syntax, `llms.txt`, and XML sitemaps.

### 2. JSON-LD Schema Generator
Instantly generate validated, copy-pasteable JSON-LD schemas:

```bash
# Generate FAQPage schema
npx seoanything schema faq

# Generate Article / BlogPosting schema
npx seoanything schema article

# Generate Organization schema and save to file
npx seoanything schema organization --out=./public/schema-org.html

# Available types:
# article | faq | organization | breadcrumbs | product | software | howto | local
```

### 3. AI Search `llms.txt` Generator
Generate an `llms.txt` file at your domain root so AI search engines (Perplexity, GPTBot, ClaudeBot) can rapidly discover and cite your documentation:

```bash
npx seoanything llms-txt
```

### 4. XML Sitemap Generator
Automatically scan your routes or HTML files and generate a standard `sitemap.xml`:

```bash
npx seoanything sitemap https://yourdomain.com
```

---

## 🚀 4 End-to-End Real World Workflows

### Workflow 1: Complete Overhaul with the All-in-One Master Skill (`seo-master`)
*(Best when you want complete SEO intelligence without selecting individual sub-skills)*
1. Instruct your agent in Cursor, Claude, Antigravity, or Copilot:
   > *"Using `seo-master`, optimize our entire application. Audit Core Web Vitals, implement valid self-referential canonicals and robots.txt, generate Organization and Article JSON-LD, format content with BLUF answer-first writing, and ensure our documentation routes form an interlinked topic silo."*
2. Re-run `npx seoanything audit .` to verify an **A (90–100) Score**.

### Workflow 2: Auditing & Fixing a Next.js Project
1. Run the audit:
   ```bash
   npx seoanything audit .
   ```
2. Feed the output to your AI assistant:
   > *"Here is the audit output from `seoanything audit .`. Please fix all missing canonical tags, add missing image alt attributes, and add Article schema to our blog template."*
3. Re-run `npx seoanything audit .` to confirm an **A (90+) Score**.

### Workflow 3: Writing a Blog Article That Ranks #1
1. Instruct your agent:
   > *"Use `seo-master` (or `seo-content` and `seo-geo`). Write an article for 'Best Headless CMS for Next.js in 2026'. Ensure the first paragraph answers the query directly using BLUF formatting, include a comparison table, and provide structured FAQs with JSON-LD."*
2. Use the bundled template in [`templates/blog-post-template.md`](templates/blog-post-template.md).

### Workflow 4: Getting Cited in Perplexity & ChatGPT Search
1. Generate `llms.txt`:
   ```bash
   npx seoanything llms-txt
   ```
2. Instruct your agent:
   > *"Review our main product page using `seo-master` (or `seo-geo`). Increase our statistical density by converting qualitative claims into quantitative metrics with explicit dates, and ensure each section is a standalone passage."*

---

## 🤖 Cross-Agent Compatibility Matrix

SEOAnything automatically adapts to whichever AI agent or environment you use:

```text
seoanything/
├── .agents/skills/          <-- Google Antigravity (AGY) progressive skills
├── .cursor/rules/*.mdc      <-- Cursor IDE rule files
├── .cursor/skills/          <-- Cursor skill workflows
├── .claude/skills/          <-- Claude Code agent skills
├── CLAUDE.md                <-- Claude session context
├── GEMINI.md / AGENTS.md    <-- Gemini & universal agents
├── .github/copilot-instructions.md  <-- GitHub Copilot workspace instructions
├── .windsurfrules           <-- Windsurf IDE
└── SEO.md                   <-- Universal human & LLM playbook
```

---

## 💻 Programmatic Node.js API

You can also import and use SEOAnything programmatically in Node.js scripts, CI/CD pipelines, or custom build workflows:

```javascript
import { auditHtml, generateSchema, generateLlmsTxt, generateSitemap } from 'seoanything';

// 1. Audit an HTML string
const report = auditHtml(htmlContent, 'index.html');
console.log(`Page Score: ${report.score}/100 (Grade ${report.grade})`);

// 2. Generate JSON-LD
const faqSchema = generateSchema('faq', {
  faqs: [
    {
      "@type": "Question",
      "name": "How does GEO work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GEO optimizes passages and data density for AI search engines."
      }
    }
  ]
});
console.log(faqSchema.snippet);

// 3. Generate XML sitemap
generateSitemap('https://mywebsite.com');
```

---

## 🧪 Running Tests

SEOAnything includes a native, zero-dependency Node.js test suite:

```bash
npm test
```

---

## 📄 License

MIT © [SEOAnything Community](LICENSE)
