import fs from 'node:fs';
import path from 'node:path';
import { findFiles, colors, logSuccess } from './utils.js';

export function generateSitemap(baseUrl = 'https://example.com', options = {}) {
  const rootDir = process.cwd();
  const today = new Date().toISOString().split('T')[0];

  const htmlFiles = findFiles(rootDir, ['.html', '.md', '.mdx']);
  const urls = new Set();

  // Always include homepage
  urls.add('/');

  for (const file of htmlFiles) {
    const rel = path.relative(rootDir, file).replace(/\\/g, '/');
    // Normalize path to clean URL
    let cleanUrl = '/' + rel.replace(/\.(html|md|mdx)$/, '');
    if (cleanUrl.endsWith('/index')) {
      cleanUrl = cleanUrl.replace(/\/index$/, '') || '/';
    }
    if (!cleanUrl.startsWith('/node_modules') && !cleanUrl.startsWith('/.')) {
      urls.add(cleanUrl);
    }
  }

  const urlEntries = Array.from(urls).map(u => {
    const fullLoc = `${baseUrl.replace(/\/$/, '')}${u === '/' ? '' : u}`;
    const priority = u === '/' ? '1.0' : (u.split('/').length <= 2 ? '0.8' : '0.6');
    return `  <url>
    <loc>${fullLoc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>`;

  let targetPath = path.join(rootDir, 'sitemap.xml');
  const publicDir = path.join(rootDir, 'public');
  if (fs.existsSync(publicDir) && fs.statSync(publicDir).isDirectory()) {
    targetPath = path.join(publicDir, 'sitemap.xml');
  }

  fs.writeFileSync(targetPath, xmlContent.trim() + '\n', 'utf-8');
  console.log(`\n${colors.bold}${colors.green}✔ Generated XML Sitemap (${urls.size} URLs) at: ${targetPath}${colors.reset}\n`);
  return { path: targetPath, count: urls.size };
}
