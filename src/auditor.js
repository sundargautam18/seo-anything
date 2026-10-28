import fs from 'node:fs';
import path from 'node:path';
import { findFiles, colors, logHeader } from './utils.js';

/**
 * Audit target: file, directory, or URL
 */
export async function runAudit(targetPathOrUrl, options = {}) {
  const isUrl = /^https?:\/\//i.test(targetPathOrUrl);

  if (isUrl) {
    return await auditUrl(targetPathOrUrl, options);
  } else {
    return await auditLocal(targetPathOrUrl, options);
  }
}

/**
 * Audit a live URL
 */
async function auditUrl(url, options) {
  logHeader(`Auditing Live URL: ${url}`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEOAnythingBot/1.0; +https://github.com/seoanything)'
      }
    });

    if (!res.ok) {
      console.log(`${colors.red}✖ HTTP Error ${res.status}: ${res.statusText}${colors.reset}`);
      return;
    }

    const html = await res.text();
    const result = auditHtml(html, url);
    printAuditReport([result], { isUrl: true });
    return result;
  } catch (err) {
    console.log(`${colors.red}✖ Failed to fetch URL: ${err.message}${colors.reset}`);
  }
}

/**
 * Audit local path (file or directory)
 */
async function auditLocal(targetPath, options) {
  const resolved = path.resolve(process.cwd(), targetPath);
  if (!fs.existsSync(resolved)) {
    console.log(`${colors.red}✖ Path does not exist: ${resolved}${colors.reset}`);
    return;
  }

  const stat = fs.statSync(resolved);
  let filesToAudit = [];

  if (stat.isFile()) {
    filesToAudit = [resolved];
  } else {
    logHeader(`Scanning Directory: ${resolved}`);
    filesToAudit = findFiles(resolved);
  }

  if (filesToAudit.length === 0) {
    console.log(`${colors.yellow}⚠ No HTML, JSX, TSX, Vue, Svelte, Astro, or MD files found to audit.${colors.reset}`);
    return;
  }

  console.log(`${colors.cyan}Found ${filesToAudit.length} files to audit...\n${colors.reset}`);

  const results = [];
  for (const filePath of filesToAudit) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relPath = path.relative(process.cwd(), filePath);
    const result = auditHtml(content, relPath);
    results.push(result);
  }

  // Check root files (robots.txt, llms.txt, sitemap.xml)
  const rootDir = stat.isDirectory() ? resolved : path.dirname(resolved);
  const rootAudit = auditRootFiles(rootDir);

  printAuditReport(results, { rootAudit });
  return { results, rootAudit };
}

/**
 * Audit root domain files
 */
function auditRootFiles(dir) {
  const possibleDirs = [dir, path.join(dir, 'public'), path.join(dir, 'static')];
  
  const hasFile = (fileName) => {
    return possibleDirs.some(d => fs.existsSync(path.join(d, fileName)));
  };

  return {
    robotsTxt: hasFile('robots.txt'),
    sitemapXml: hasFile('sitemap.xml') || hasFile('sitemap_index.xml'),
    llmsTxt: hasFile('llms.txt'),
  };
}

/**
 * Core HTML analyzer
 */
export function auditHtml(html, filePath) {
  const issues = [];
  const passes = [];
  const isDocOrSkill = filePath.endsWith('.md') || filePath.endsWith('.mdx');

  // Parse YAML Frontmatter if present
  let fm = {};
  const fmMatch = html.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fmMatch) {
    const lines = fmMatch[1].split('\n');
    let currentKey = null;
    let currentValue = '';
    for (const line of lines) {
      const match = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
      if (match) {
        if (currentKey) fm[currentKey] = currentValue.trim().replace(/^['"> -]+|['"]+$/g, '');
        currentKey = match[1];
        currentValue = match[2];
      } else if (currentKey) {
        currentValue += ' ' + line.trim();
      }
    }
    if (currentKey) fm[currentKey] = currentValue.trim().replace(/^['"> -]+|['"]+$/g, '');
  }

  // 1. Title Tag / Frontmatter Title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  let title = titleMatch ? titleMatch[1].trim() : (fm.title || fm.name || null);

  if (!title) {
    issues.push({ type: 'error', category: 'On-Page', msg: 'Missing <title> tag or frontmatter title.' });
  } else if (title.length < 15 && !isDocOrSkill) {
    issues.push({ type: 'warn', category: 'On-Page', msg: `<title> is too short (${title.length} chars). Aim for 50–60 characters. Title: "${title}"` });
  } else if (title.length > 70) {
    issues.push({ type: 'warn', category: 'On-Page', msg: `<title> is too long (${title.length} chars). May be truncated in Google SERP. Title: "${title}"` });
  } else {
    passes.push({ category: 'On-Page', msg: `<title> / name is defined (${title.length} chars): "${title}"` });
  }

  // 2. Meta Description / Frontmatter Description
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
                        html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
  let metaDesc = metaDescMatch ? metaDescMatch[1].trim() : (fm.description || null);

  if (!metaDesc) {
    issues.push({ type: 'error', category: 'On-Page', msg: 'Missing meta description or frontmatter description.' });
  } else if (metaDesc.length < 50 && !isDocOrSkill) {
    issues.push({ type: 'warn', category: 'On-Page', msg: `Meta description is too short (${metaDesc.length} chars). Aim for 140–160 characters.` });
  } else if (metaDesc.length > 250 && !isDocOrSkill) {
    issues.push({ type: 'warn', category: 'On-Page', msg: `Meta description is too long (${metaDesc.length} chars). May truncate in SERP.` });
  } else {
    passes.push({ category: 'On-Page', msg: `Meta description is defined (${metaDesc.length} chars).` });
  }

  // 3. Viewport Meta Tag
  const viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*>/i);
  if (!viewportMatch && !isDocOrSkill) {
    issues.push({ type: 'error', category: 'Technical', msg: 'Missing viewport meta tag (Critical for Mobile-First indexing).' });
  } else if (!isDocOrSkill) {
    passes.push({ category: 'Technical', msg: 'Viewport meta tag present.' });
  }

  // 4. Canonical Tag
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i) ||
                         (fm.canonicalUrl ? [null, fm.canonicalUrl] : null);
  if (!canonicalMatch && !isDocOrSkill) {
    issues.push({ type: 'warn', category: 'Technical', msg: 'Missing canonical URL link (<link rel="canonical" href="...">).' });
  } else if (canonicalMatch) {
    passes.push({ category: 'Technical', msg: `Canonical URL configured: ${canonicalMatch[1]}` });
  }

  // 5. Open Graph & Social
  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*>/i);
  const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*>/i);
  if (!isDocOrSkill) {
    if (!ogTitle || !ogImage) {
      issues.push({ type: 'warn', category: 'Social/Share', msg: 'Incomplete Open Graph tags (og:title or og:image missing).' });
    } else {
      passes.push({ category: 'Social/Share', msg: 'Open Graph social tags present.' });
    }
  }

  // 6. Heading Hierarchy (H1, H2, H3)
  const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  if (h1Matches.length === 0) {
    // Check if markdown H1 exists
    const mdH1 = html.match(/^#\s+[^\n]+/m);
    if (!mdH1) {
      issues.push({ type: 'error', category: 'Content/Structure', msg: 'Missing <h1> tag. Every page must contain exactly one <h1>.' });
    } else {
      passes.push({ category: 'Content/Structure', msg: 'Exactly one H1 heading found.' });
    }
  } else if (h1Matches.length > 1) {
    issues.push({ type: 'warn', category: 'Content/Structure', msg: `Multiple <h1> tags found (${h1Matches.length}). Use exactly one <h1> per page.` });
  } else {
    passes.push({ category: 'Content/Structure', msg: 'Exactly one H1 heading found.' });
  }

  // 7. Image Alt Attributes (actual <img> tags with src)
  const imgRegex = /<img\s+([^>]*src=["'][^"']+["'][^>]*)>/gi;
  let totalImages = 0;
  let missingAltImages = 0;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    totalImages++;
    const imgAttrs = match[1];
    const altMatch = imgAttrs.match(/alt=["']([^"']*)["']/i);
    if (!altMatch || altMatch[1].trim() === '') {
      missingAltImages++;
    }
  }

  if (missingAltImages > 0) {
    issues.push({ type: 'error', category: 'Accessibility/SEO', msg: `${missingAltImages} of ${totalImages} image(s) missing descriptive alt attributes.` });
  } else if (totalImages > 0) {
    passes.push({ category: 'Accessibility/SEO', msg: `All ${totalImages} images have alt attributes.` });
  }

  // 8. Structured Data (JSON-LD)
  const jsonLdRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let jsonLdCount = 0;
  let validJsonLdCount = 0;
  let schemaTypes = [];
  let scriptMatch;
  while ((scriptMatch = jsonLdRegex.exec(html)) !== null) {
    jsonLdCount++;
    try {
      const parsed = JSON.parse(scriptMatch[1].trim());
      validJsonLdCount++;
      const type = parsed['@type'] || (Array.isArray(parsed) ? 'Array' : 'Unknown');
      schemaTypes.push(type);
    } catch (e) {
      issues.push({ type: 'error', category: 'Structured Data', msg: `Syntax error in JSON-LD script: ${e.message}` });
    }
  }

  if (jsonLdCount === 0) {
    issues.push({ type: 'warn', category: 'Structured Data', msg: 'No JSON-LD structured data found. Add Schema markup for rich snippets.' });
  } else {
    passes.push({ category: 'Structured Data', msg: `Valid JSON-LD schema found: [${schemaTypes.join(', ')}]` });
  }

  // 9. Word Count & Content Depth
  const cleanText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = cleanText ? cleanText.split(/\s+/).length : 0;
  if (words < 250 && !filePath.endsWith('.json') && !filePath.endsWith('.xml')) {
    issues.push({ type: 'warn', category: 'Content/Depth', msg: `Low text content depth (${words} words). Risk of thin-content demotion.` });
  } else {
    passes.push({ category: 'Content/Depth', msg: `Substantial content depth (${words} words).` });
  }

  // Calculate Score (0 - 100)
  const totalChecks = issues.length + passes.length;
  const errors = issues.filter(i => i.type === 'error').length;
  const warnings = issues.filter(i => i.type === 'warn').length;
  
  // Errors deduct 15 points, warnings deduct 5 points
  let score = Math.max(0, 100 - (errors * 15) - (warnings * 5));

  let grade = 'A';
  if (score < 50) grade = 'F';
  else if (score < 75) grade = 'C';
  else if (score < 90) grade = 'B';

  return {
    file: filePath,
    title,
    metaDesc,
    score,
    grade,
    words,
    issues,
    passes,
  };
}

/**
 * Print colorized audit report
 */
function printAuditReport(results, extra = {}) {
  for (const res of results) {
    const scoreColor = res.score >= 90 ? colors.green : (res.score >= 75 ? colors.cyan : (res.score >= 50 ? colors.yellow : colors.red));
    console.log(`\n📄 ${colors.bold}${res.file}${colors.reset}`);
    console.log(`   Score: ${scoreColor}${colors.bold}${res.score}/100 (Grade ${res.grade})${colors.reset} | Words: ${res.words}`);
    
    if (res.issues.length > 0) {
      console.log(`   ${colors.bold}Issues Found:${colors.reset}`);
      for (const issue of res.issues) {
        const icon = issue.type === 'error' ? `${colors.red}✖` : `${colors.yellow}⚠`;
        console.log(`     ${icon} [${issue.category}] ${issue.msg}${colors.reset}`);
      }
    }

    if (res.passes.length > 0) {
      console.log(`   ${colors.bold}Passing Checks:${colors.reset}`);
      for (const pass of res.passes) {
        console.log(`     ${colors.green}✔ [${pass.category}] ${pass.msg}${colors.reset}`);
      }
    }
  }

  // Print Root Domain Health (GEO & Crawlability)
  if (extra.rootAudit) {
    console.log(`\n${colors.bold}${colors.blue}🌐 Root Domain & AI Search Health:${colors.reset}`);
    const { robotsTxt, sitemapXml, llmsTxt } = extra.rootAudit;
    console.log(`   ${robotsTxt ? colors.green + '✔' : colors.red + '✖'} robots.txt: ${robotsTxt ? 'Found' : 'Missing (Crucial for crawler guidance)'}${colors.reset}`);
    console.log(`   ${sitemapXml ? colors.green + '✔' : colors.red + '✖'} sitemap.xml: ${sitemapXml ? 'Found' : 'Missing (Needed for rapid URL discovery)'}${colors.reset}`);
    console.log(`   ${llmsTxt ? colors.green + '✔' : colors.yellow + '⚠'} llms.txt: ${llmsTxt ? 'Found' : 'Missing (Recommended for Generative AI search / GEO)'}${colors.reset}`);
  }

  // Summary
  const avgScore = Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length);
  const avgColor = avgScore >= 90 ? colors.green : (avgScore >= 75 ? colors.cyan : (avgScore >= 50 ? colors.yellow : colors.red));
  console.log(`\n${colors.bold}==========================================${colors.reset}`);
  console.log(`Overall Health Score: ${avgColor}${colors.bold}${avgScore}/100${colors.reset} across ${results.length} audited page(s).`);
  console.log(`${colors.bold}==========================================\n${colors.reset}`);
}
