import fs from 'node:fs';
import path from 'node:path';
import { colors, logSuccess } from './utils.js';

export const SUPPORTED_SCHEMAS = [
  'article',
  'faq',
  'organization',
  'breadcrumbs',
  'product',
  'howto',
  'software',
  'local'
];

/**
 * Generate JSON-LD Schema
 */
export function generateSchema(type, params = {}) {
  const schemaType = (type || 'article').toLowerCase();

  let schemaObj = null;

  switch (schemaType) {
    case 'article':
    case 'blog':
      schemaObj = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": params.headline || "How to Master Modern SEO & AI Search in 2026",
        "description": params.description || "A comprehensive architectural guide to ranking on Google, Perplexity, and AI Overviews.",
        "image": params.image || "https://example.com/images/cover.webp",
        "datePublished": params.datePublished || new Date().toISOString(),
        "dateModified": params.dateModified || new Date().toISOString(),
        "author": {
          "@type": "Person",
          "name": params.authorName || "Expert Author",
          "jobTitle": params.authorTitle || "SEO Architect",
          "url": params.authorUrl || "https://example.com/authors/expert",
          "sameAs": params.authorSocial ? [params.authorSocial] : [
            "https://linkedin.com/in/expert",
            "https://github.com/expert"
          ]
        },
        "publisher": {
          "@type": "Organization",
          "name": params.publisherName || "Site Name",
          "logo": {
            "@type": "ImageObject",
            "url": params.publisherLogo || "https://example.com/logo.png"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": params.url || "https://example.com/blog/seo-guide"
        }
      };
      break;

    case 'faq':
      schemaObj = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": params.faqs || [
          {
            "@type": "Question",
            "name": "What is Generative Engine Optimization (GEO)?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Generative Engine Optimization (GEO) is the practice of optimizing content so AI models (Perplexity, ChatGPT, AI Overviews) synthesize and cite your pages as authoritative sources."
            }
          },
          {
            "@type": "Question",
            "name": "How does Core Web Vitals affect search rankings?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Google uses Core Web Vitals (LCP, INP, CLS) as a direct page experience ranking signal. Passing all three metrics is essential for top placement."
            }
          }
        ]
      };
      break;

    case 'organization':
      schemaObj = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": params.name || "Acme Software",
        "url": params.url || "https://example.com",
        "logo": params.logo || "https://example.com/logo.png",
        "sameAs": params.socials || [
          "https://twitter.com/example",
          "https://linkedin.com/company/example",
          "https://github.com/example",
          "https://www.wikidata.org/wiki/Q123456"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": params.phone || "+1-800-555-0199",
          "contactType": "customer service"
        }
      };
      break;

    case 'breadcrumbs':
      schemaObj = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": params.breadcrumbs || [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://example.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Blog",
            "item": "https://example.com/blog"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "SEO Playbook",
            "item": "https://example.com/blog/seo-playbook"
          }
        ]
      };
      break;

    case 'product':
      schemaObj = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": params.name || "Enterprise Analytics Pro",
        "image": params.image || "https://example.com/product.webp",
        "description": params.description || "Real-time search intelligence and analytics suite.",
        "brand": {
          "@type": "Brand",
          "name": params.brand || "Acme"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": params.rating || "4.9",
          "reviewCount": params.reviewCount || "256"
        },
        "offers": {
          "@type": "Offer",
          "url": params.url || "https://example.com/pricing",
          "priceCurrency": params.currency || "USD",
          "price": params.price || "99.00",
          "availability": "https://schema.org/InStock"
        }
      };
      break;

    case 'software':
      schemaObj = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": params.name || "SEOAnything CLI",
        "operatingSystem": "All",
        "applicationCategory": "DeveloperApplication",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "140"
        },
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      };
      break;

    case 'howto':
      schemaObj = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": params.name || "How to Audit Core Web Vitals",
        "step": params.steps || [
          {
            "@type": "HowToStep",
            "name": "Measure LCP",
            "text": "Run Lighthouse or Chrome DevTools to locate the Largest Contentful Paint element."
          },
          {
            "@type": "HowToStep",
            "name": "Optimize Server TTFB",
            "text": "Deploy edge CDN caching to reduce Time to First Byte below 800ms."
          }
        ]
      };
      break;

    case 'local':
      schemaObj = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": params.name || "Acme Dental Care",
        "image": params.image || "https://example.com/storefront.webp",
        "telephone": params.phone || "+1-555-123-4567",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": params.street || "123 Main St",
          "addressLocality": params.city || "San Francisco",
          "addressRegion": params.region || "CA",
          "postalCode": params.zip || "94105",
          "addressCountry": "US"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": params.lat || 37.7749,
          "longitude": params.lng || -122.4194
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "09:00",
            "closes": "18:00"
          }
        ]
      };
      break;

    default:
      throw new Error(`Unsupported schema type: "${type}". Supported: ${SUPPORTED_SCHEMAS.join(', ')}`);
  }

  const jsonString = JSON.stringify(schemaObj, null, 2);
  const snippet = `<script type="application/ld+json">\n${jsonString}\n</script>`;

  return {
    object: schemaObj,
    json: jsonString,
    snippet,
  };
}

/**
 * CLI runner for schema generator
 */
export function runSchemaCli(type, options = {}) {
  const result = generateSchema(type, options);
  console.log(`\n${colors.bold}${colors.green}✔ Generated JSON-LD Schema: [${type}]${colors.reset}\n`);
  console.log(result.snippet);
  console.log(`\n${colors.gray}Tip: Paste this snippet into the <head> or <body> of your page.${colors.reset}\n`);

  if (options.out) {
    const dest = path.resolve(process.cwd(), options.out);
    fs.writeFileSync(dest, result.snippet, 'utf-8');
    logSuccess(`Saved schema snippet to: ${dest}`);
  }

  return result;
}
