# 📚 SMITE Knowledge Base - Technical Documentation Links

## 📦 Framework & Libraries Documentation

### React Ecosystem

#### React Core

- **Official Docs**: https://react.dev/
- **API Reference**: https://react.dev/reference/react
- **Hooks**: https://react.dev/reference/react

#### Next.js

- **Documentation**: https://nextjs.org/docs
- **API Reference**: https://nextjs.org/docs/api
- **App Router**: https://nextjs.org/docs/app
- **Pages Router**: https://nextjs.org/docs/pages
- **Deployment**: https://nextjs.org/docs/deployment

#### State Management

**Zustand**

- **GitHub**: https://github.com/pmndrs/zustand
- **Docs**: https://zustand.docs.pmnd.rs/
- **API**: https://zustand.docs.pmnd.rs/api
- **Tutorial**: https://docs.pmnd.rs/zustand/getting-started

**Jotai**

- **GitHub**: https://github.com/jotai/jotai
- **Docs**: https://jotai.org/
- **API**: https://jotai.org/api/core/

**Redux Toolkit**

- **Docs**: https://redux-toolkit.js.org/
- **Tutorial**: https://redux-toolkit.js.org/tutorials/essentials

#### Data Fetching

**TanStack Query**

- **Docs**: https://tanstack.com/query/latest/docs/react/overview
- **GitHub**: https://github.com/TanStack/query
- **DevTools**: https://tanstack.com/query/latest/docs/devtools/overview

**TanStack Router**

- **Docs**: https://tanstack.com/router/latest/
- **GitHub**: https://github.com/TanStack/router

**SWR**

- **GitHub**: https://swr.vercel.app/
- **Docs**: https://swr.vercel.app/

### Rust Ecosystem

#### Core

- **The Rust Book**: https://doc.rust-lang.org/book/
- **Rust by Example**: https://doc.rust-lang.org/rust-by-example/
- **Rust Reference**: https://doc.rust-lang.org/reference/
- **Standard Library**: https://doc.rust-lang.org/std/

#### Web Frameworks

**Axum**

- **GitHub**: https://github.com/tokio/rs/axum
- **Docs**: https://docs.rs/axum/latest/axum/
- **Examples**: https://github.com/tokio/axum/tree/main/examples

**Actix Web**

- **GitHub**: https://github.com/actix/actix-web
- **Docs**: https://docs.rs/actix-web/actix_web/
- **Guide**: https://actix.rs/

**Rocket**

- **GitHub**: https://github.com/RocketRocket/Rocket
- **Guide**: https://rocket.rs/v0.5/guide/

#### Async Runtime

**Tokio**

- **GitHub**: https://github.com/tokio-rs/tokio
- **Docs**: https://tokio.rs/tokio/topics/
- **Guide**: https://tokio.rs/tokio/tutorial/

#### Database

**SQLx**

- **GitHub**: https://github.com/launchbadge/sqlx
- **Docs**: https://docs.rs/sqlx/latest/sqlx/
- **Crates**: https://crates.io/crates/sqlx/

**SeaORM**

- **GitHub**: https://github.com/SeaQL/sea-orm
- **Docs**: https://www.sea-orm.org/

**Diesel**

- **GitHub**: https://github.com/diesel-rs/diesel
- **Docs**: https://diesel.rs/

### Python Ecosystem

#### Web Frameworks

**FastAPI**

- **Docs**: https://fastapi.tiangolo.com/
- **GitHub**: https://github.com/tiangolo/fastapi
- **Tutorial**: https://fastapi.tiangolo.com/tutorial/

**Django**

- **Docs**: https://docs.djangoproject.com/
- **Tutorial**: https://docs.djangoproject.com/en/stable/intro/tutorial01/
- **API**: https://docs.djangoproject.com/en/stable/

**Flask**

- **Docs**: https://flask.palletsprojects.com/
- **API**: https://flask.palletsprojects.com/en/latest/api/
- **Tutorial**: https://flask.palletsprojects.com/en/latest/tutorial/

#### Async

**asyncio**

- **Docs**: https://docs.python.org/3/library/asyncio.html
- **Tutorial**: https://docs.python.org/3/library/asyncio-task.html

### Build Tools

#### Vite

- **Docs**: https://vitejs.dev/
- **Config**: https://vitejs.dev/config/
- **Plugins**: https://vitejs.dev/plugins/

#### Turbopack

- **Docs**: https://turbo.build/pack
- **GitHub**: https://github.com/vercel/turbo

#### esbuild

- **Docs**: https://esbuild.github.io/
- **API**: https://esbuild.github.io/api/

### Testing

#### Vitest

- **Docs**: https://vitest.dev/
- **API**: https://vitest.dev/api/
- **Guide**: https://vitest.dev/guide/

#### Jest

- **Docs**: https://jestjs.io/
- **API**: https://jestjs.io/docs/api

#### Playwright

- **Docs**: https://playwright.dev/
- **API**: https://playwright.dev/docs/api/class-playwright

### Styling

#### Tailwind CSS

- **Docs**: https://tailwindcss.com/docs
- **Components**: https://tailwindui.com/
- **Plugins**: https://tailwindcss.com/docs/plugins

#### CSS-in-JS

- **Emotion**: https://emotion.sh/docs
- **Styled Components**: https://styled-components.com/docs
- **Fela**: https://fela-js.com/

### TypeScript

#### Official

- **Docs**: https://www.typescriptlang.org/docs/
- **Handbook**: https://www.typescriptlang.org/docs/handbook/intro.html
- **Declaration Files**: https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html

#### TypeDefs

- **DefinitelyTyped**: https://github.com/DefinitelyTyped
- **Search**: https://www.typescriptlang.org/dt/

### Node.js

#### Official

- **Docs**: https://nodejs.org/docs
- **API**: https://nodejs.org/api/
- **Guides**: https://nodejs.org/en/docs/guides/

---

## 🎯 Usage in Agents

### How to Reference Docs in Agent Prompts

When creating or using SMITE agents, you can reference these documentation links:

**Example in smite-constructor SKILL.md:**

```markdown
## Technical Stack References

When implementing with this agent, refer to:

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Zustand**: https://zustand.docs.pmnd.rs/
```

**Example in smite-constructor output:**

```markdown
## Implementation Notes

I used the following resources:

- Next.js App Router: https://nextjs.org/docs/app
- Server Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components
- Zustand store setup: https://zustand.docs.pmnd.rs/guides/overview
```

---

## 🔗 Quick Links by Agent

### smite-constructor

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev/
- **Rust Book**: https://doc.rust-lang.org/book/
- **Python FastAPI**: https://fastapi.tiangolo.com/

### smite-explorer

- **React Docs**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Node.js**: https://nodejs.org/docs/

### smite-surgeon

- **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/intro.html
- **React Performance**: https://react.dev/learn/render-and-commit
- **Rust Performance**: https://doc.rust-lang.org/book/ch16-00-optimizing.html

### smite-gatekeeper

- **Testing Library Docs**: Vitest, Jest, Playwright
- **Linting**: ESLint, TypeScript
- **Best Practices**: Language-specific guides

---

## 📦 Adding New Documentation

To add new documentation links, edit this file and follow the structure:

```markdown
### Technology Name

**Core Docs**

- **Primary**: https://example.com/docs
- **API**: https://example.com/api
- **Tutorial**: https://example.com/tutorial

**Frameworks/Libraries**

- **Library1**: https://example.com/lib1
- **Library2**: https://example.com/lib2
```

---

**📚 SMITE Knowledge Base v1.0**
_Centralized documentation hub for all SMITE agents_
