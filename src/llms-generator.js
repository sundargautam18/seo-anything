import fs from 'node:fs';
import path from 'node:path';
import { colors, logSuccess, ensureDir } from './utils.js';

export function generateLlmsTxt(options = {}) {
  const rootDir = process.cwd();
  let siteName = options.title || 'My Web Project';
  let siteDesc = options.description || 'Modern high-performance web application optimized for search and AI discovery.';

  // Attempt to read package.json for project context
  const pkgPath = path.join(rootDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      if (pkg.name && !options.title) siteName = pkg.name;
      if (pkg.description && !options.description) siteDesc = pkg.description;
    } catch (e) {
      // Ignore
    }
  }

  // Scan for existing docs/content to build the index
  const links = [];
  const candidateDirs = ['docs', 'content', 'blog', 'pages', 'src/pages', 'skills'];

  for (const dir of candidateDirs) {
    const fullDir = path.join(rootDir, dir);
    if (fs.existsSync(fullDir) && fs.statSync(fullDir).isDirectory()) {
      const files = fs.readdirSync(fullDir);
      for (const file of files) {
        if (file.endsWith('.md') || file.endsWith('.mdx') || file.endsWith('.html')) {
          const name = file.replace(/\.(md|mdx|html)$/, '').replace(/[-_]/g, ' ');
          const titleCase = name.charAt(0).toUpperCase() + name.slice(1);
          links.push(`- [${titleCase}](/${dir}/${file}): ${titleCase} guide and reference.`);
        }
      }
    }
  }

  if (links.length === 0) {
    links.push('- [Overview](/docs/overview): Architecture, setup, and key features.');
    links.push('- [Getting Started](/docs/getting-started): Step-by-step developer guide.');
    links.push('- [API Reference](/docs/api): Public endpoints, parameters, and schemas.');
  }

  const content = `# ${siteName}

> ${siteDesc}

## Core Documentation & Guides

${links.slice(0, 10).join('\n')}

## Technical Specifications

- Framework / Stack: Modern Web & Node.js
- SEO Standards: SEOAnything Compliant
- AI Discovery: Optimized for Google AI Overviews, Perplexity, ChatGPT Search, and Gemini
- Contact / Maintainer: ${options.contact || 'team@example.com'}
`;

  // Write to ./llms.txt or public/llms.txt if public folder exists
  let targetPath = path.join(rootDir, 'llms.txt');
  const publicDir = path.join(rootDir, 'public');
  if (fs.existsSync(publicDir) && fs.statSync(publicDir).isDirectory()) {
    targetPath = path.join(publicDir, 'llms.txt');
  }

  fs.writeFileSync(targetPath, content.trim() + '\n', 'utf-8');
  console.log(`\n${colors.bold}${colors.green}✔ Generated llms.txt at: ${targetPath}${colors.reset}\n`);
  console.log(content);
  return { path: targetPath, content };
}
