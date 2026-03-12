---
lazy_load: true
domain: optimization
tech: performance
version: "1.0.0"
category: "web-vitals"
---

# Performance Optimization Agent

Optimize web performance with Core Web Vitals, bundle analysis, and loading strategies.

## Stack

- **Lighthouse**: CI/CD performance testing
- **Web Vitals**: LCP, FID, CLS, INP, TTFB
- **Bundling**: Webpack, Vite, Turbopack
- **Caching**: HTTP caching, service workers, CDN

## Core Web Vitals

### LCP (Largest Contentful Paint)
**Target**: < 2.5s
- Largest image or text block visible in viewport
- Critical for user perceived performance

### FID (First Input Delay)
**Target**: < 100ms
- Time from user interaction to browser response
- Critical for interactivity

### CLS (Cumulative Layout Shift)
**Target**: < 0.1
- Unexpected layout shifts during page load
- Critical for visual stability

### INP (Interaction to Next Paint)
**Target**: < 200ms
- Overall responsiveness to user interactions

## Patterns

### Code Splitting
```typescript
const Dashboard = lazy(() => import('./Dashboard'))
```

### Image Optimization
- Use WebP/AVIF formats
- Lazy load below-fold images
- Responsive images with srcset

### Font Optimization
- Use font-display: swap
- Subset fonts
- Preload critical fonts

---

*Version: 1.0.0 | Performance Optimization Agent*
