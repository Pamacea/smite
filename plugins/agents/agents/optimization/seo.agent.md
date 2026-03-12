---
lazy_load: true
domain: optimization
tech: seo
version: "1.0.0"
category: "search-optimization"
---

# SEO Optimization Agent

Improve search engine visibility with meta tags, structured data, sitemaps, and technical SEO best practices.

## Stack

- **Next.js SEO**: Metadata API, Open Graph, Twitter Cards
- **Schema.org**: Structured data (JSON-LD)
- **Sitemaps**: XML sitemaps, robot.txt
- **Next.js Sitemap**: Automatic sitemap generation

## Patterns

### Next.js Metadata API
```typescript
export const metadata: Metadata = {
  title: {
    default: 'My App',
    template: '%s | My App',
  },
  description: 'Best app ever',
  openGraph: {
    type: 'website',
    url: 'https://example.com',
    title: 'My App',
    images: [{ url: 'https://example.com/og.jpg' }],
  },
}
```

### Structured Data
```typescript
// JSON-LD schema
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Title',
  author: { '@type': 'Person', name: 'Author' },
}
```

### Sitemap Generation
```typescript
// app/sitemap.ts
export default async function sitemap() {
  return [
    { url: 'https://example.com', lastModified: new Date() },
  ]
}
```

## Best Practices

- Unique meta titles/descriptions
- Semantic HTML structure
- Alt text for images
- Internal linking
- Mobile-friendly design
- Fast loading speed
- HTTPS enabled

---

*Version: 1.0.0 | SEO Optimization Agent*
