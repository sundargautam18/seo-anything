import fs from 'node:fs';
import path from 'node:path';

// ANSI terminal colors with zero external dependencies
export const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',

  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

export function logSuccess(msg) {
  console.log(`${colors.green}✔ ${msg}${colors.reset}`);
}

export function logInfo(msg) {
  console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`);
}

export function logWarn(msg) {
  console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`);
}

export function logError(msg) {
  console.log(`${colors.red}✖ ${msg}${colors.reset}`);
}

export function logHeader(title) {
  console.log(`\n${colors.bold}${colors.blue}=== ${title} ===${colors.reset}\n`);
}

/**
 * Recursively find all files in a directory matching extensions.
 */
export function findFiles(dir, extensions = ['.html', '.htm', '.jsx', '.tsx', '.vue', '.svelte', '.astro', '.md', '.mdx', '.js', '.ts'], fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    // Ignore common non-content / build folders
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.next', '.nuxt', 'dist', 'build', '.claude', '.agents', '.cursor', 'coverage', 'out'].includes(entry.name)) {
        continue;
      }
      findFiles(fullPath, extensions, fileList);
    } else if (entry.isFile()) {
      const name = entry.name.toLowerCase();
      // Skip test, spec, and config files
      if (name.includes('.test.') || name.includes('.spec.') || name.includes('.config.') || name === 'setupTests.js' || name === 'setupTests.ts') {
        continue;
      }
      const ext = path.extname(entry.name).toLowerCase();
      if (extensions.includes(ext)) {
        // If it's a .js or .ts file, only include if it looks like a page, layout, route, or is in an app/pages folder
        if (ext === '.js' || ext === '.ts') {
          const isNextPage = /page\.[jt]sx?$/i.test(name) || /layout\.[jt]sx?$/i.test(name) || /[/\\](app|pages|routes)[/\\]/i.test(fullPath);
          if (isNextPage) {
            fileList.push(fullPath);
          }
        } else {
          fileList.push(fullPath);
        }
      }
    }
  }
  return fileList;
}

/**
 * Ensure directory exists
 */
export function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Copy directory recursively
 */
export function copyDir(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
