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

test('auditHtml correctly recognizes Next.js App Router metadata, <Image priority>, and JSON-LD', () => {
  const nextAppPage = `
    import Image from 'next/image';
    import type { Metadata } from 'next';

    export const metadata: Metadata = {
      title: 'Next.js App Router SEO Mastery Guide [2026]',
      description: 'Master server-side rendering, generateMetadata, Core Web Vitals, and JSON-LD structured data in Next.js.',
      alternates: {
        canonical: 'https://example.com/blog/nextjs-seo',
      },
      openGraph: {
        title: 'Next.js App Router SEO Mastery Guide',
        images: ['/og-next.png'],
      },
    };

    export default function Page() {
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Next.js App Router SEO Mastery Guide',
      };

      return (
        <main>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <h1>Next.js App Router SEO Mastery Guide [2026]</h1>
          <p>Next.js provides built-in support for metadata, sitemaps, robots.ts, and automatic image optimization.</p>
          <Image
            src="/hero-next.png"
            alt="Next.js SEO Architecture"
            width={1200}
            height={630}
            priority
          />
        </main>
      );
    }
  `;

  const report = auditHtml(nextAppPage, 'app/blog/page.tsx');
  assert.equal(report.grade, 'A');
  assert.ok(report.score >= 90, `Expected score >= 90 for Next.js page, got ${report.score}`);
  
  const passCategories = report.passes.map(p => p.category);
  assert.ok(passCategories.includes('Next.js Metadata'));
  assert.ok(passCategories.includes('Performance/CWV'));
  assert.ok(passCategories.includes('Structured Data'));
  assert.equal(report.title, 'Next.js App Router SEO Mastery Guide [2026]');
});

test('auditHtml supports dynamic Next.js generateMetadata', () => {
  const dynamicNextPage = `
    import Image from 'next/image';

    export async function generateMetadata({ params }): Promise<Metadata> {
      return {
        title: 'Dynamic Product - ' + params.id,
        description: 'Discover full specifications and pricing for product ' + params.id,
      };
    }

    export default function ProductPage() {
      return (
        <div>
          <h1>Dynamic Product Page</h1>
          <Image src="/prod.jpg" alt="Product photo" width={400} height={400} />
        </div>
      );
    }
  `;

  const report = auditHtml(dynamicNextPage, 'app/products/[id]/page.tsx');
  assert.ok(report.score >= 80, `Expected score >= 80, got ${report.score}`);
  assert.ok(['A', 'B'].includes(report.grade));
  const passCategories = report.passes.map(p => p.category);
  assert.ok(passCategories.includes('Next.js Metadata'));
  assert.ok(report.passes.some(p => p.msg.includes('generateMetadata')));
});
