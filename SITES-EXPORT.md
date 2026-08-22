# Standing — ChatGPT Sites source export

Exported from the live SignalSuite prototype on 2026-08-21.

## Provenance

- Hosted product name: SignalSuite
- Intended product name: Standing
- Sites version: 3
- Source commit: `507231e04be2aab2d8bd293dcd0308f2e6d20e98`
- Live deployment at export: `https://signalsuite.kinetic1.chatgpt.site`

The application source was exported without modification. The product rename and AWS migration are intentionally deferred so this archive remains a reproducible baseline.

## Included

- Application source and static assets
- Package manifest and lockfile
- API routes
- Drizzle schema and migrations
- Tests and build configuration
- Sites hosting manifest for migration reference

## Excluded

- Git repository internals
- `node_modules`
- Compiled `dist` output
- Wrangler and runtime caches
- Hosted environment values, credentials, and secrets

## Baseline verification

```bash
npm ci
npm test
npm run build
```

## AWS migration boundaries

The following Sites-specific surfaces require deliberate replacement rather than blind porting:

- Sign in with ChatGPT paths and identity headers
- Cloudflare D1 persistence and Drizzle runtime binding
- Sites/Vinext build and Worker entry points
- `.openai/hosting.json` and hosted environment configuration

Preserve this export unchanged. Perform the Standing rename and AWS adaptation in subsequent commits.
