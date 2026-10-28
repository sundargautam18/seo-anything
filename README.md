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

**SEOAnything** solves this by packaging **9 specialized, progressive-disclosure Agent Skills (`SKILL.md`)** alongside an automated CLI auditor, structured data generator, and multi-agent installer.

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

Once installed, your AI agent automatically absorbs the 9 specialized SEO runbooks. Here is exactly how to prompt and collaborate with each agent:

### 1. 🖱️ Using with Cursor IDE

Cursor automatically loads `.cursor/rules/*.mdc` whenever you edit `.html`, `.jsx`, `.tsx`, `.vue`, `.svelte`, `.astro`, or `.md` files.

#### How to prompt Cursor:
You can mention specific skills using `@` or simply ask in natural language in the Cursor Composer (`Cmd+I` / `Ctrl+I`) or Chat (`Cmd+L` / `Ctrl+L`):

```text
# Example 1: Auditing & Fixing a Next.js Page
"Audit @app/blog/[slug]/page.tsx using seo-audit. Fix any missing canonical tags, optimize headings to have exactly one H1, and ensure the hero <Image> has the priority attribute."

# Example 2: Writing a 100% Ranking Article
"Use @seo-content and @seo-geo to draft a 1,500-word blog post in app/blog/posts/nextjs-seo.mdx targeting 'Next.js SEO Best Practices'. Apply the BLUF inverted-pyramid answering framework, add a structured comparison table, and generate valid Article JSON-LD."

# Example 3: Adding Structured Data
"Use @seo-schema to generate a complete FAQPage and Organization JSON-LD script for our homepage."
```

---

### 2. 🤖 Using with Claude Code / Claude Desktop

Claude Code reads your project's `CLAUDE.md` and discovers all skills in `.claude/skills/`.

#### How to prompt Claude:
In your terminal where Claude Code is active:

```bash
# Example 1: Run an audit and auto-fix findings
> Run `npx seoanything audit .` and fix all warnings and errors found across our routes.

# Example 2: Create a high-converting Topic Cluster
> Based on seo-keywords, build a Pillar & Cluster topical map for our SaaS product. Give me 1 Pillar topic and 6 long-tail cluster articles with search intent classifications.

# Example 3: AI Search (GEO) Optimization
> Review our landing page and optimize the copy for Perplexity and ChatGPT Search using the seo-geo skill. Inject verifiable benchmark data and format direct definitional soundbites.
```

---

### 3. 🛸 Using with Google Antigravity (`agy`)

Antigravity uses native **Progressive Disclosure** via `.agents/skills/<skill>/SKILL.md`. Antigravity only injects the skill when your prompt indicates you need it, preserving your model context window.

#### How to prompt Antigravity:
```text
# Example 1: Comprehensive SEO Audit & Fix
"Run a technical SEO audit on this workspace using seo-audit. Check Core Web Vitals, sitemaps, robots.txt, and canonicals, then output a prioritized remediation plan."

# Example 2: Internal Linking Silos
"Use seo-links to analyze our documentation routes and design a topical silo architecture with descriptive anchor text rules and zero orphan pages."
```

---

### 4. 🌐 Using with Gemini, ChatGPT & Universal Agents

For generic LLMs, SEOAnything generates a master [`SEO.md`](SEO.md), [`GEMINI.md`](GEMINI.md), and [`AGENTS.md`](AGENTS.md) in your root directory.

#### How to prompt:
```text
"Review this page against the rules defined in AGENTS.md and SEO.md. Ensure our headings follow a strict H1 -> H2 -> H3 hierarchy, all images contain descriptive alt text, and the Core Web Vitals LCP threshold of 2.5s is satisfied."
```

---

## 🧠 The 9 Core SEO & GEO Skills

SEOAnything provides 9 granular, production-tested skills built on the open **Agent Skills Standard (`SKILL.md`)**:

| Skill | Category | Description & Capabilities |
| :--- | :--- | :--- |
| **[`seo-master`](skills/seo-master/SKILL.md)** | Orchestration | High-level search strategist. Triages issues, creates 90-day SEO roadmaps, prioritizes high-impact wins, and diagnoses algorithmic drops. |
| **[`seo-technical`](skills/seo-technical/SKILL.md)** | Technical SEO | Core Web Vitals (LCP < 2.5s, INP < 200ms, CLS < 0.1), `robots.txt`, XML sitemaps, canonicals, redirect loops, SSR/SSG hydration traps, and hreflang. |
| **[`seo-keywords`](skills/seo-keywords/SKILL.md)** | Keyword & Intent | 4-Tier Intent taxonomy (Informational, Commercial, Transactional, Navigational), Pillar-Cluster (Hub & Spoke) architecture, and entity salience. |
| **[`seo-content`](skills/seo-content/SKILL.md)** | Content & E-E-A-T | BLUF (Bottom Line Up Front) inverted-pyramid writing, Google Helpful Content compliance, author credentials, and title/meta CTR optimization. |
| **[`seo-geo`](skills/seo-geo/SKILL.md)** | AI Search & GEO | Generative Engine Optimization for Perplexity, ChatGPT Search, and Google AI Overviews. LLM passage retrieval, statistical density, and `llms.txt`. |
| **[`seo-schema`](skills/seo-schema/SKILL.md)** | Structured Data | JSON-LD generators and validators for `Article`, `FAQPage`, `Organization`, `BreadcrumbList`, `Product`, `HowTo`, and `SoftwareApplication`. |
| **[`seo-links`](skills/seo-links/SKILL.md)** | Link Architecture | Topical silo design, descriptive anchor text rules, PageRank sculpting, orphan page eradication, and Digital PR outreach playbooks. |
| **[`seo-programmatic`](skills/seo-programmatic/SKILL.md)**| Scaled pSEO | Safely scaling 100 to 10,000+ dynamic landing pages with >60% unique data ratio to avoid Google doorway and thin-content penalties. |
| **[`seo-audit`](skills/seo-audit/SKILL.md)** | Diagnostics | 100-point master SEO checklist, automated CLI HTML/meta/schema scanner, and ranking drop diagnostic decision trees. |

---

## 🛠️ Built-in CLI Tooling

SEOAnything bundles zero-dependency CLI utilities that both developers and AI agents can execute directly:

### 1. Automated SEO & GEO Auditor
Audit local directories, Next.js projects, HTML/JSX/Vue/Astro files, or live URLs:

```bash
# Audit current repository or Next.js app
npx seoanything audit .

# Audit a specific Next.js page or component
npx seoanything audit ./app/blog/[slug]/page.tsx

# Audit a specific production page
npx seoanything audit https://example.com/blog/my-guide
```

**Checks & Framework Features:**
- ✅ **Next.js App Router**: Parses `export const metadata`, dynamic `generateMetadata()`, and `alternates.canonical`
- ✅ **Next.js `<Image />` & Core Web Vitals**: Detects `priority` / `fetchpriority="high"` for LCP hero optimization and audits `alt` attributes
- ✅ **Next.js Metadata Files**: Recognizes `app/robots.ts`, `app/sitemap.ts`, and `app/opengraph-image.tsx`
- ✅ **Next.js JSON-LD**: Audits structured data in `<script type="application/ld+json" dangerouslySetInnerHTML={{ ... }} />`
- ✅ Title & Meta description presence & length constraints (40–60 chars title, 140–160 chars meta)
- ✅ Viewport configuration (Mobile-first indexing)
- ✅ Canonical tag validation
- ✅ Open Graph & Twitter Social Cards
- ✅ Heading hierarchy (Ensures single `<h1>`, flags skipped levels)
- ✅ Image `alt` attributes on rendered elements
- ✅ JSON-LD schema syntax & type detection
- ✅ Content word count & thin-content risk
- ✅ Root health: `robots.txt`, `sitemap.xml`, and `llms.txt`

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

## 🚀 3 End-to-End Real World Workflows

### Workflow 1: Auditing & Fixing a Next.js Project
1. Run the audit:
   ```bash
   npx seoanything audit .
   ```
2. Feed the output to your AI assistant:
   > *"Here is the audit output from `seoanything audit .`. Please fix all missing canonical tags, add missing image alt attributes, and add Article schema to our blog template."*
3. Re-run `npx seoanything audit .` to confirm an **A (90+) Score**.

### Workflow 2: Writing a Blog Article That Ranks #1
1. Instruct your agent:
   > *"Use the `seo-content` and `seo-geo` skills. Write an article for 'Best Headless CMS for Next.js in 2026'. Ensure the first paragraph answers the query directly using BLUF formatting, include a comparison table, and provide structured FAQs."*
2. Use the bundled template in [`templates/blog-post-template.md`](templates/blog-post-template.md).

### Workflow 3: Getting Cited in Perplexity & ChatGPT Search
1. Generate `llms.txt`:
   ```bash
   npx seoanything llms-txt
   ```
2. Instruct your agent:
   > *"Review our main product page using `seo-geo`. Increase our statistical density by converting qualitative claims into quantitative metrics with explicit dates, and ensure each section is a standalone passage."*

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
