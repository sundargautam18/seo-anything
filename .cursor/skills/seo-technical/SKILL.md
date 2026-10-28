---
name: seo-technical
description: >-
  Technical SEO specialist. Use this skill when auditing or implementing Core Web Vitals (LCP, INP, CLS),
  robots.txt, XML sitemaps, canonical tags, redirects (301, 302, 404, 410), crawl budget, SSR/SSG/ISR
  rendering, mobile responsiveness, HTTPS/security headers, and hreflang internationalization.
---

# Technical SEO & Infrastructure Excellence

Technical SEO ensures that search engine crawlers and AI bots can discover, render, understand, and index your website without friction or delay. A website with flawless content will never rank if technical flaws prevent crawlers from accessing it or if slow speed destroys Core Web Vitals.

---

## 1. Core Web Vitals (CWV) Benchmark & Optimization

Google enforces Core Web Vitals as a direct page experience ranking signal. Target the "Good" threshold for at least 75% of page visits:

| Metric | Threshold (Good) | What It Measures | Primary Fixes |
| :--- | :--- | :--- | :--- |
| **LCP** (Largest Contentful Paint) | **≤ 2.5 seconds** | Loading speed of the main content element | • Preload hero image: `<link rel="preload" as="image" href="..." fetchpriority="high">`<br>• Use modern formats (WebP, AVIF)<br>• Optimize TTFB (< 800ms) with edge CDN caching<br>• Inline critical CSS, defer non-critical scripts |
| **INP** (Interaction to Next Paint) | **≤ 200 ms** | Responsiveness to user clicks/taps | • Break long tasks (> 50ms) using `scheduler.yield()` or `requestAnimationFrame`<br>• Debounce input and scroll event listeners<br>• Avoid CPU-heavy client hydration on the main thread |
| **CLS** (Cumulative Layout Shift) | **≤ 0.1** | Visual stability during page load | • Always set explicit `width` and `height` (or `aspect-ratio`) on images/videos<br>• Reserve slot containers for dynamic ads or widgets<br>• Use `font-display: swap` with size-adjust fallback fonts |

---

## 2. Robots.txt Specification & Guardrails

The `robots.txt` file must reside at the root domain (`https://example.com/robots.txt`).

### Standard Production `robots.txt`
```txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /checkout/
Disallow: /private/

# Explicitly allow AI search retrieval crawlers
User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

# Sitemap Declarations
Sitemap: https://example.com/sitemap.xml
Sitemap: https://example.com/sitemap-blog.xml
```

### Critical Robots.txt Pitfalls
- **NEVER** disallow CSS or JavaScript directories (`/assets/`, `/_next/`, `/static/`). Googlebot and Perplexity need CSS/JS to render the DOM.
- **NEVER** use `Disallow: /` on staging environments that share a database or when deploying to production.
- Use `robots.txt` to control crawl budget, NOT to hide sensitive data (use HTTP authentication or `noindex` headers for private pages).

---

## 3. Canonicalization Rules

Every indexable URL must have an explicit canonical link element in the `<head>`:

```html
<link rel="canonical" href="https://example.com/blog/technical-seo-guide" />
```

### Best Practices:
1. **Self-Referential Canonicals**: Every clean, canonical page should point to its exact self.
2. **Handle URL Parameters**: Strip tracking parameters (`?utm_source=...`, `?ref=...`, `?fbclid=...`) in the canonical target.
3. **HTTP vs HTTPS & WWW vs non-WWW**: Standardize on one version and enforce 301 redirects to it. Canonical must match the canonical protocol/subdomain.
4. **Trailing Slashes**: Enforce either trailing slash (`/page/`) or non-trailing slash (`/page`) consistently site-wide.

---

## 4. Redirect Strategy & Status Codes

| HTTP Status | Name | SEO Treatment | When to Use |
| :--- | :--- | :--- | :--- |
| **200** | OK | Standard indexable response | Normal live page |
| **301** | Moved Permanently | Passes ~99% of PageRank; search engines update their index | Permanent URL migration, domain change, slug update |
| **302** | Found (Temporary) | Does NOT transfer full link equity; index retains original URL | Temporary maintenance or seasonal campaigns |
| **404** | Not Found | Dropped from index after repeated crawls | Page permanently removed with no direct replacement |
| **410** | Gone | Dropped from index faster than 404 | Intentional deletion of spam or dead sections |
| **500 / 503**| Server Error | Crawler backs off; temporary 503 avoids ranking penalty | Maintenance window; never leave 500s active |

> [!WARNING]
> **Zero Redirect Chains**: Avoid chaining redirects (e.g., `A -> B -> C`). Always update source links to point directly to `C`.

---

## 5. Rendering Architectures: SSR, SSG, and Hydration

Modern frontend frameworks (Next.js, Nuxt, Astro, SvelteKit, Remix) handle rendering differently:

1. **Static Site Generation (SSG)**: Fastest TTFB, zero server overhead. Ideal for blogs, docs, and marketing pages.
2. **Server-Side Rendering (SSR)**: Generates HTML on the server per request. Ideal for personalized, dynamic, or frequently changing inventory.
3. **Client-Side Rendering (CSR / SPA)**: Dangerous for SEO. If the initial HTML payload is an empty `<div id="root"></div>`, crawlers may delay execution or fail to parse text and meta tags. Always use pre-rendering or SSR for public pages.
4. **Hydration Traps**: Ensure server-rendered HTML matches client-rendered markup. Mismatches cause layout shifts (ruining CLS) and can wipe out rendered text before crawlers parse it.

---

## 6. Internationalization (`hreflang`)

When serving multilingual or multi-regional audiences, implement bi-directional hreflang tags:

```html
<link rel="alternate" hreflang="en-us" href="https://example.com/us/pricing" />
<link rel="alternate" hreflang="en-gb" href="https://example.com/uk/pricing" />
<link rel="alternate" hreflang="es" href="https://example.com/es/precios" />
<link rel="alternate" hreflang="x-default" href="https://example.com/pricing" />
```

- Each language version must point back to itself and all siblings (bi-directional requirement).
- Use `x-default` for unmatched regions or a language selector splash page.
