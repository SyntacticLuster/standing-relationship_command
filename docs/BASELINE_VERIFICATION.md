# Baseline Verification — Imported Sites Prototype

## Imported commit

`a1d811be38632c95652f8032c0fab5f02c2e9854`  
`chore: import Standing prototype from ChatGPT Sites`

Source export provenance (from `SITES-EXPORT.md`):
- Hosted product name: SignalSuite
- Intended product name: Standing
- Sites version: 3
- Original source commit: `507231e04be2aab2d8bd293dcd0308f2e6d20e98`
- Live deployment at export: `https://signalsuite.kinetic1.chatgpt.site`

## Runtime environment

| Item    | Value    |
|---------|----------|
| Node.js | v22.22.0 (`/usr/bin/node`) |
| npm     | 10.9.4   |

Note: the system also has Node v20.19.6 via nvm, which does **not** satisfy the
`>=22.13.0` engine requirement. All commands below were run with Node v22.

## Commands executed

```bash
npm ci
npm test   # expands to: npm run build && node --test tests/rendered-html.test.mjs
```

## Results

### `npm ci`

Exit 0. Two deprecation warnings for `@esbuild-kit/esm-loader` and
`@esbuild-kit/core-utils` (both merged into `tsx`). These do not affect the
build or tests. 507 packages installed.

### `npm test` (build + test)

Exit 0. Full vinext build completed in five stages:

1. Analyze client references — 251 modules
2. Analyze server references — 49 modules
3. Build RSC environment — 257 modules
4. Build client environment — 57 modules
5. Build SSR environment — 55 modules

Test suite: 1 test, 1 pass, 0 fail.

```
ok 1 - packages the SignalSuite product shell and durable workspace capability
# tests 1 / pass 1 / fail 0
```

## Sites-specific runtime dependencies

| Package | Version | Role |
|---------|---------|------|
| `vinext` | 0.0.50 | Cloudflare Worker + Next.js build/runtime adapter |
| `vite` | 8.0.13 | Build tool (used by vinext) |
| `@cloudflare/vite-plugin` | 1.37.1 | Cloudflare Worker integration for Vite |
| `@vitejs/plugin-react` | 6.0.2 | React RSC support |
| `@vitejs/plugin-rsc` | 0.5.26 | React Server Components support |
| `wrangler` | 4.92.0 | Cloudflare Worker CLI / Miniflare local runtime |
| `react-server-dom-webpack` | 19.2.6 | RSC webpack runtime (used by vinext) |
| `drizzle-orm` | 0.45.2 | ORM (currently using `drizzle-orm/d1` for Cloudflare D1) |

## Warnings that do not prevent the baseline from working

- `@esbuild-kit/esm-loader@2.6.5` and `@esbuild-kit/core-utils@3.3.2` are
  deprecated (merged into `tsx`). These are transitive dependencies of
  `drizzle-kit` and do not affect runtime behavior.
- Node v20 is present on the system but is incompatible with `vinext`,
  `miniflare`, and `wrangler` (all require `>=22`). The correct Node v22 binary
  is at `/usr/bin/node`.
- The `build/sites-vite-plugin.ts` import in `vite.config.ts` uses a bare
  relative path without a `.ts` extension; this works because Vite resolves it
  at build time.
