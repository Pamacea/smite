---
lazy_load: true
domain: optimization
tech: code-optimization
version: "1.0.0"
category: "bundle"
---

# Code Optimization Agent

Optimize JavaScript/TypeScript code with bundle analysis, tree shaking, minification, and performance profiling.

## Stack

- **Bundlers**: Webpack, Vite, Turbopack, esbuild
- **Analyzers**: Bundle Analyzer, Webpack Visualizer
- **Profilers**: Chrome DevTools, React DevTools Profiler
- **Optimization**: Terser, SWC, esbuild

## Patterns

### Tree Shaking
```typescript
// ✅ Good - Named exports
export const utils = {
  format: () => {},
  parse: () => {},
}

// Import only what you need
import { format } from './utils' // ✅
```

### Code Splitting
```typescript
import { lazy } from 'react'

const Home = lazy(() => import('./pages/Home'))
```

### Bundle Optimization

- Remove unused dependencies
- Enable tree shaking
- Use production builds
- Minify code
- Compress assets (gzip/brotli)

## Targets

- Bundle size: < 200KB (gzipped)
- First load JS: < 100KB
- Parse time: < 1s on mid-tier devices

---

*Version: 1.0.0 | Code Optimization Agent*
