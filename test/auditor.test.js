import { test } from 'node:test';
import assert from 'node:assert/strict';
import { auditHtml } from '../src/auditor.js';

test('auditHtml scores 100 on fully optimized page', () => {
  const perfectHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Best SEO Practices for Modern Web Apps in 2026</title>
      <meta name="description" content="Discover actionable technical SEO, Core Web Vitals, and Generative Engine Optimization strategies to rank higher on Google and Perplexity today.">
      <link rel="canonical" href="https://example.com/blog/best-seo-practices">
      <meta property="og:title" content="Best SEO Practices">
      <meta property="og:image" content="https://example.com/og.jpg">
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Best SEO Practices"
      }
      </script>
    </head>
    <body>
      <h1>Best SEO Practices for Modern Web Apps in 2026</h1>
      <p>Generative Engine Optimization and Technical SEO are the cornerstones of modern organic traffic acquisition. In this comprehensive guide, we examine every critical dimension needed to rank.</p>
      <img src="/hero.webp" alt="SEO Architecture Diagram" width="800" height="400">
      <h2>1. Core Web Vitals Optimization</h2>
      <p>Ensuring that Largest Contentful Paint stays below 2.5 seconds requires preloading critical hero images and inline critical styling.</p>
      <p>Interaction to Next Paint must remain below 200 milliseconds to guarantee seamless user responsiveness across all viewport sizes.</p>
      <p>Cumulative Layout Shift must not exceed 0.1 by reserving fixed container dimensions for dynamic embeds and third-party widgets.</p>
    </body>
    </html>
  `;

  const report = auditHtml(perfectHtml, 'index.html');
  assert.equal(report.grade, 'A');
  assert.ok(report.score >= 90, `Expected score >= 90, got ${report.score}`);
  assert.equal(report.issues.filter(i => i.type === 'error').length, 0);
});

test('auditHtml catches missing title, meta description, and alt tags', () => {
  const flawedHtml = `
    <!DOCTYPE html>
    <html>
    <body>
      <img src="/banner.jpg">
      <p>Hello world</p>
    </body>
    </html>
  `;

  const report = auditHtml(flawedHtml, 'flawed.html');
  assert.ok(report.score < 60, `Expected score < 60, got ${report.score}`);
  
  const errorCategories = report.issues.map(i => i.category);
  assert.ok(errorCategories.includes('On-Page'));
  assert.ok(errorCategories.includes('Accessibility/SEO'));
  assert.ok(errorCategories.includes('Technical'));
});
