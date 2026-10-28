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
  const possibleDirs = [
    dir, 
    path.join(dir, 'public'), 
    path.join(dir, 'static'),
    path.join(dir, 'app'),
    path.join(dir, 'src', 'app'),
    path.join(dir, 'routes'),
    path.join(dir, 'src', 'routes')
  ];
  
  const hasFile = (...fileNames) => {
    return fileNames.some(fn => {
      return possibleDirs.some(d => fs.existsSync(path.join(d, fn))) ||
             fs.existsSync(path.join(dir, fn)) ||
             fs.existsSync(path.join(dir, 'app', fn)) ||
             fs.existsSync(path.join(dir, 'src', 'app', fn)) ||
             fs.existsSync(path.join(dir, 'routes', fn)) ||
             fs.existsSync(path.join(dir, 'src', 'routes', fn));
    });
  };

  const hasRobots = hasFile('robots.txt', 'robots.ts', 'robots.js');
  const hasSitemap = hasFile('sitemap.xml', 'sitemap_index.xml', 'sitemap.ts', 'sitemap.js');
  const hasLlms = hasFile('llms.txt');
  const hasOgImage = hasFile('opengraph-image.tsx', 'opengraph-image.jpg', 'opengraph-image.png', 'opengraph-image.js');

  return {
    robotsTxt: hasRobots,
    sitemapXml: hasSitemap,
    llmsTxt: hasLlms,
    ogImage: hasOgImage,
  };
}

/**
 * Multi-framework metadata extractor (Next.js, TanStack Start, Astro, Remix, Nuxt, SvelteKit)
 */
function extractFrameworkMetadata(html, filePath) {
  const meta = {
    framework: null,
    title: null,
    description: null,
    canonical: null,
    hasOpenGraph: false,
    hasDynamicMetadata: false,
    isFrameworkManaged: false,
  };

  // 1. Next.js (App Router & Pages Router)
  if (/\b(page|layout)\.(jsx|tsx|js|ts)$/i.test(filePath) || /[/\\](app|pages)[/\\]/i.test(filePath) || /from ['"]next\//i.test(html) || /export\s+(const\s+metadata|async\s+function\s+generateMetadata|const\s+viewport)/.test(html)) {
    meta.framework = 'Next.js';
    meta.isFrameworkManaged = true;

    if (/export\s+async\s+function\s+generateMetadata/i.test(html)) {
      meta.hasDynamicMetadata = true;
      meta.title = '[Dynamic generateMetadata()]';
      meta.description = '[Dynamic generateMetadata()]';
      if (/canonical/i.test(html)) meta.canonical = '[Dynamic canonical]';
      if (/openGraph|images/i.test(html)) meta.hasOpenGraph = true;
    }

    if (/export\s+const\s+metadata\b/.test(html) || /const\s+metadata\b/.test(html)) {
      const titleM = html.match(/title:\s*['"`]([^'"`]+)['"`]/) || html.match(/title:\s*\{\s*default:\s*['"`]([^'"`]+)['"`]/);
      if (titleM) meta.title = titleM[1].trim();

      const descM = html.match(/description:\s*['"`]([^'"`]+)['"`]/);
      if (descM) meta.description = descM[1].trim();

      const canM = html.match(/alternates:\s*\{[\s\S]*?canonical:\s*['"`]([^'"`]+)['"`]/) || html.match(/canonical:\s*['"`]([^'"`]+)['"`]/);
      if (canM) meta.canonical = canM[1].trim();

      if (/openGraph:\s*\{/.test(html)) meta.hasOpenGraph = true;
    }
  }

  // 2. TanStack Start (createFileRoute / createRootRoute / head method)
  if (/createFileRoute|createRootRoute|createRoute/i.test(html) || /@tanstack\/(react-router|start)/i.test(html)) {
    meta.framework = 'TanStack Start';
    meta.isFrameworkManaged = true;

    // Title in meta array: [{ title: '...' }]
    const tanTitle = html.match(/\{\s*title:\s*['"`]([^'"`]+)['"`]\s*\}/) || html.match(/title:\s*['"`]([^'"`]+)['"`]/);
    if (tanTitle) meta.title = tanTitle[1].trim();

    // Description in meta array: [{ name: 'description', content: '...' }]
    const tanDesc = html.match(/\{\s*name:\s*['"`]description['"`]\s*,\s*content:\s*['"`]([^'"`]+)['"`]/) ||
                    html.match(/content:\s*['"`]([^'"`]+)['"`]\s*,\s*name:\s*['"`]description['"`]/);
    if (tanDesc) meta.description = tanDesc[1].trim();

    // Canonical in links array: [{ rel: 'canonical', href: '...' }]
    const tanCan = html.match(/\{\s*rel:\s*['"`]canonical['"`]\s*,\s*href:\s*['"`]([^'"`]+)['"`]/) ||
                   html.match(/href:\s*['"`]([^'"`]+)['"`]\s*,\s*rel:\s*['"`]canonical['"`]/);
    if (tanCan) meta.canonical = tanCan[1].trim();

    if (/property:\s*['"`]og:/i.test(html) || /openGraph/i.test(html)) {
      meta.hasOpenGraph = true;
    }
  }

  // 3. Astro (.astro files or astro-seo component)
  if (filePath.endsWith('.astro') || /from ['"]astro/i.test(html) || /<SEO\b/i.test(html)) {
    meta.framework = 'Astro';
    meta.isFrameworkManaged = true;

    // astro-seo component: <SEO title="..." description="..." canonical="..." />
    const seoComp = html.match(/<SEO\b([^>]*)/i);
    if (seoComp) {
      const attrs = seoComp[1];
      const titleM = attrs.match(/title=(?:["']([^'"]+)["']|\{([^}]+)\})/);
      if (titleM) meta.title = (titleM[1] || titleM[2]).trim().replace(/^['"`]|['"`]$/g, '');

      const descM = attrs.match(/description=(?:["']([^'"]+)["']|\{([^}]+)\})/);
      if (descM) meta.description = (descM[1] || descM[2]).trim().replace(/^['"`]|['"`]$/g, '');

      const canM = attrs.match(/canonical=(?:["']([^'"]+)["']|\{([^}]+)\})/);
      if (canM) meta.canonical = (canM[1] || canM[2]).trim().replace(/^['"`]|['"`]$/g, '');

      if (/openGraph=/i.test(attrs)) meta.hasOpenGraph = true;
    }

    // Astro frontmatter variables: const title = '...', const description = '...'
    if (!meta.title) {
      const titleVar = html.match(/(?:const|let|var)\s+title\s*=\s*['"`]([^'"`]+)['"`]/i);
      if (titleVar) meta.title = titleVar[1].trim();
    }
    if (!meta.description) {
      const descVar = html.match(/(?:const|let|var)\s+description\s*=\s*['"`]([^'"`]+)['"`]/i);
      if (descVar) meta.description = descVar[1].trim();
    }
  }

  // 4. Remix / React Router v7
  if (/export\s+const\s+meta\b.*MetaFunction/i.test(html) || /from ['"]@remix-run\//i.test(html) || /from ['"]react-router['"]/i.test(html)) {
    meta.framework = 'Remix / React Router';
    meta.isFrameworkManaged = true;

    const remixTitle = html.match(/\{\s*title:\s*['"`]([^'"`]+)['"`]\s*\}/);
    if (remixTitle) meta.title = remixTitle[1].trim();

    const remixDesc = html.match(/\{\s*name:\s*['"`]description['"`]\s*,\s*content:\s*['"`]([^'"`]+)['"`]/) ||
                      html.match(/content:\s*['"`]([^'"`]+)['"`]\s*,\s*name:\s*['"`]description['"`]/);
    if (remixDesc) meta.description = remixDesc[1].trim();

    const remixCan = html.match(/\{\s*tagName:\s*['"`]link['"`][^}]*rel:\s*['"`]canonical['"`][^}]*href:\s*['"`]([^'"`]+)['"`]/) ||
                     html.match(/href:\s*['"`]([^'"`]+)['"`][^}]*rel:\s*['"`]canonical['"`]/);
    if (remixCan) meta.canonical = remixCan[1].trim();

    if (/property:\s*['"`]og:/i.test(html)) meta.hasOpenGraph = true;
  }

  // 5. Nuxt 3 (useSeoMeta or useHead)
  if (/useSeoMeta\s*\(|useHead\s*\(|<NuxtImg|<NuxtPicture/i.test(html) || (filePath.endsWith('.vue') && /use(SeoMeta|Head)/.test(html))) {
    meta.framework = 'Nuxt 3';
    meta.isFrameworkManaged = true;

    const nuxtTitle = html.match(/title:\s*['"`]([^'"`]+)['"`]/);
    if (nuxtTitle) meta.title = nuxtTitle[1].trim();

    const nuxtDesc = html.match(/description:\s*['"`]([^'"`]+)['"`]/);
    if (nuxtDesc) meta.description = nuxtDesc[1].trim();

    const nuxtCan = html.match(/canonical:\s*['"`]([^'"`]+)['"`]/) ||
                    html.match(/rel:\s*['"`]canonical['"`]\s*,\s*href:\s*['"`]([^'"`]+)['"`]/);
    if (nuxtCan) meta.canonical = nuxtCan[1].trim();

    if (/ogTitle|ogDescription|ogImage|property:\s*['"`]og:/i.test(html)) {
      meta.hasOpenGraph = true;
    }
  }

  // 6. SvelteKit (<svelte:head>)
  if (/<svelte:head\b/i.test(html) || filePath.endsWith('.svelte')) {
    meta.framework = 'SvelteKit';
    meta.isFrameworkManaged = true;
  }

  return meta;
}

/**
 * Core HTML / Next.js / TanStack Start / Astro / Framework analyzer
 */
export function auditHtml(html, filePath) {
  const issues = [];
  const passes = [];
  const isDocOrSkill = filePath.endsWith('.md') || filePath.endsWith('.mdx');

  // Multi-Framework Metadata Extraction
  const fw = extractFrameworkMetadata(html, filePath);

  if (fw.framework) {
    passes.push({ category: `${fw.framework} Integration`, msg: `${fw.framework} framework conventions detected.` });
  }

  // Parse YAML Frontmatter if present (Astro / Markdown / Skills)
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

  // 1. Title Tag / Framework Metadata / Frontmatter Title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  let title = titleMatch ? titleMatch[1].trim() : (fw.title || (fm.title || fm.name || null));

  if (!title) {
    issues.push({ type: 'error', category: 'On-Page', msg: 'Missing <title> tag, framework metadata title, or frontmatter title.' });
  } else if (title === '[Dynamic generateMetadata()]') {
    passes.push({ category: 'On-Page', msg: 'Title handled dynamically via Next.js generateMetadata().' });
  } else if (title.length < 15 && !isDocOrSkill) {
    issues.push({ type: 'warn', category: 'On-Page', msg: `<title> is too short (${title.length} chars). Aim for 50–60 characters. Title: "${title}"` });
  } else if (title.length > 70) {
    issues.push({ type: 'warn', category: 'On-Page', msg: `<title> is too long (${title.length} chars). May be truncated in Google SERP. Title: "${title}"` });
  } else {
    passes.push({ category: 'On-Page', msg: `<title> / name is defined (${title.length} chars): "${title}"` });
  }

  // 2. Meta Description / Framework Metadata / Frontmatter Description
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
                        html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
  let metaDesc = metaDescMatch ? metaDescMatch[1].trim() : (fw.description || (fm.description || null));

  if (!metaDesc) {
    issues.push({ type: 'error', category: 'On-Page', msg: 'Missing meta description tag, framework metadata description, or frontmatter description.' });
  } else if (metaDesc === '[Dynamic generateMetadata()]') {
    passes.push({ category: 'On-Page', msg: 'Meta description handled dynamically via Next.js generateMetadata().' });
  } else if (metaDesc.length < 50 && !isDocOrSkill) {
    issues.push({ type: 'warn', category: 'On-Page', msg: `Meta description is too short (${metaDesc.length} chars). Aim for 140–160 characters.` });
  } else if (metaDesc.length > 250 && !isDocOrSkill) {
    issues.push({ type: 'warn', category: 'On-Page', msg: `Meta description is too long (${metaDesc.length} chars). May truncate in SERP.` });
  } else {
    passes.push({ category: 'On-Page', msg: `Meta description is defined (${metaDesc.length} chars).` });
  }

  // 3. Viewport Meta Tag (Native or Framework managed)
  const viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*>/i) ||
                        /export\s+const\s+viewport\b/.test(html);
  if (!viewportMatch && !isDocOrSkill && !fw.isFrameworkManaged) {
    issues.push({ type: 'error', category: 'Technical', msg: 'Missing viewport meta tag (Critical for Mobile-First indexing).' });
  } else {
    passes.push({ category: 'Technical', msg: fw.isFrameworkManaged ? `Viewport meta tag managed by ${fw.framework || 'framework'}.` : 'Viewport meta tag present.' });
  }

  // 4. Canonical Tag (HTML link, Framework metadata, or frontmatter)
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i) ||
                         (fm.canonicalUrl ? [null, fm.canonicalUrl] : null) ||
                         (fw.canonical ? [null, fw.canonical] : null);
  if (!canonicalMatch && !isDocOrSkill) {
    issues.push({ type: 'warn', category: 'Technical', msg: 'Missing canonical URL link (<link rel="canonical" href="..."> or framework canonical).' });
  } else if (canonicalMatch) {
    passes.push({ category: 'Technical', msg: `Canonical URL configured: ${canonicalMatch[1]}` });
  }

  // 5. Open Graph & Social (Tags, Framework openGraph, or file-based cards)
  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*>/i) || fw.hasOpenGraph;
  const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*>/i) || fw.hasOpenGraph || /app\/opengraph-image/i.test(filePath);
  if (!isDocOrSkill) {
    if (!ogTitle || !ogImage) {
      issues.push({ type: 'warn', category: 'Social/Share', msg: 'Incomplete Open Graph tags (og:title or og:image missing).' });
    } else {
      passes.push({ category: 'Social/Share', msg: 'Open Graph social metadata present.' });
    }
  }

  // 6. Heading Hierarchy (H1, H2, H3)
  const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  if (h1Matches.length === 0) {
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

  // 7. Image Alt Attributes & Framework LCP Optimizations (Next.js, Astro, Nuxt)
  const imgRegex = /<(?:img|Image|NuxtImg|NuxtPicture)\s+([^>]*src=[^>]*)>/gi;
  let totalImages = 0;
  let missingAltImages = 0;
  let priorityImages = 0;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    totalImages++;
    const imgAttrs = match[1];
    const altMatch = imgAttrs.match(/alt=(?:["']([^"']*)["']|\{([^}]+)\})/i);
    if (!altMatch || (altMatch[1] && altMatch[1].trim() === '')) {
      missingAltImages++;
    }
    if (
      /\bpriority\b/i.test(imgAttrs) || 
      /fetchpriority=["']high["']/i.test(imgAttrs) || 
      /loading=["']eager["']/i.test(imgAttrs)
    ) {
      priorityImages++;
    }
  }

  if (priorityImages > 0) {
    passes.push({ category: 'Performance/CWV', msg: `${priorityImages} image(s) configured with priority / loading="eager" for optimal LCP.` });
  }

  if (missingAltImages > 0) {
    issues.push({ type: 'error', category: 'Accessibility/SEO', msg: `${missingAltImages} of ${totalImages} image(s) missing descriptive alt attributes.` });
  } else if (totalImages > 0) {
    passes.push({ category: 'Accessibility/SEO', msg: `All ${totalImages} image(s) have alt attributes.` });
  }

  // 8. Structured Data (JSON-LD) - Standard, Next.js, TanStack Start, or Nuxt
  const jsonLdRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const nextLdRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*dangerouslySetInnerHTML=\{\{\s*__html:\s*([\s\S]*?)\}\}[^>]*>/gi;
  const frameworkLd = /type:\s*['"`]application\/ld\+json['"`]/i.test(html) && !jsonLdRegex.test(html) && !nextLdRegex.test(html);

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

  while ((scriptMatch = nextLdRegex.exec(html)) !== null) {
    jsonLdCount++;
    validJsonLdCount++;
    schemaTypes.push('Next.js JSON-LD');
  }

  if (frameworkLd) {
    jsonLdCount++;
    validJsonLdCount++;
    schemaTypes.push(`${fw.framework || 'Framework'} JSON-LD`);
  }

  if (jsonLdCount === 0) {
    issues.push({ type: 'warn', category: 'Structured Data', msg: 'No JSON-LD structured data found. Add Schema markup for rich snippets.' });
  } else {
    passes.push({ category: 'Structured Data', msg: `Valid JSON-LD schema found: [${schemaTypes.join(', ')}]` });
  }

  // 9. Word Count & Content Depth
  const cleanText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = cleanText ? cleanText.split(/\s+/).length : 0;
  if (words < 250 && !filePath.endsWith('.json') && !filePath.endsWith('.xml') && !fw.isFrameworkManaged) {
    issues.push({ type: 'warn', category: 'Content/Depth', msg: `Low text content depth (${words} words). Risk of thin-content demotion.` });
  } else if (words >= 250) {
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
    const { robotsTxt, sitemapXml, llmsTxt, ogImage } = extra.rootAudit;
    console.log(`   ${robotsTxt ? colors.green + '✔' : colors.red + '✖'} robots.txt: ${robotsTxt ? 'Found' : 'Missing (Crucial for crawler guidance)'}${colors.reset}`);
    console.log(`   ${sitemapXml ? colors.green + '✔' : colors.red + '✖'} sitemap.xml: ${sitemapXml ? 'Found' : 'Missing (Needed for rapid URL discovery)'}${colors.reset}`);
    console.log(`   ${llmsTxt ? colors.green + '✔' : colors.yellow + '⚠'} llms.txt: ${llmsTxt ? 'Found' : 'Missing (Recommended for Generative AI search / GEO)'}${colors.reset}`);
    if (ogImage) {
      console.log(`   ${colors.green}✔ opengraph-image: Found (Next.js dynamic social card)${colors.reset}`);
    }
  }

  // Summary
  const avgScore = Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length);
  const avgColor = avgScore >= 90 ? colors.green : (avgScore >= 75 ? colors.cyan : (avgScore >= 50 ? colors.yellow : colors.red));
  console.log(`\n${colors.bold}==========================================${colors.reset}`);
  console.log(`Overall Health Score: ${avgColor}${colors.bold}${avgScore}/100${colors.reset} across ${results.length} audited page(s).`);
  console.log(`${colors.bold}==========================================\n${colors.reset}`);
}
