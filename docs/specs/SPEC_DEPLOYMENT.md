# Deployment Specification

**Status:** Ready for Implementation
**Phase:** Final (after Phase 4)
**Depends On:** All feature phases complete

---

## Overview

Deploy the Ritual Research Graph to production on Vercel with:
- Portal at `research.ritual.net` (or chosen domain)
- Microsites served from `/sites/[slug]`
- Proper environment configuration
- CI/CD from main branch

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  research.ritual.net                                            │
│  ├── /                    → Dashboard (Portal)                  │
│  ├── /new                 → Generation wizard                   │
│  ├── /jobs/[id]           → Job status/review                   │
│  ├── /microsites          → Microsite list                      │
│  ├── /microsites/[slug]   → Microsite detail                    │
│  ├── /entities            → Entity registry                     │
│  ├── /entities/[slug]     → Entity detail                       │
│  ├── /pipeline            → Opportunity Kanban                  │
│  ├── /api/*               → Backend API routes                  │
│  └── /sites/[slug]/*      → Generated microsites (Blob proxy)   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SUPABASE                                   │
├─────────────────────────────────────────────────────────────────┤
│  Database: Postgres (existing)                                  │
│  Auth: Google OAuth (@ritual.net)                               │
│  Realtime: Job updates, Pipeline subscriptions                  │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     VERCEL BLOB                                  │
├─────────────────────────────────────────────────────────────────┤
│  /transcripts/[job-id].md        → Uploaded transcripts         │
│  /artifacts/[job-id]/*.md        → Generated artifacts          │
│  /microsites/[slug]/             → Built static sites           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Deliverables

### 1. Vercel Project Setup

**Steps:**
1. Create Vercel project linked to GitHub repo
2. Set root directory to `apps/portal`
3. Configure build command: `npm run build`
4. Configure output directory: `.next`

**Vercel CLI (alternative):**
```bash
cd apps/portal
npx vercel link
npx vercel --prod
```

---

### 2. Environment Variables

**Required in Vercel Dashboard → Settings → Environment Variables:**

| Variable | Source | Notes |
|----------|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard | Public URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard | Server-side only |
| `ANTHROPIC_API_KEY` | Anthropic Console | Claude API |
| `XAI_API_KEY` | xAI Console | Grok API |
| `PERPLEXITY_API_KEY` | Perplexity Dashboard | Perplexity API |
| `BLOB_READ_WRITE_TOKEN` | Vercel Dashboard | For Vercel Blob |

**Production vs Preview:**
- Set all variables for "Production" environment
- Optionally set for "Preview" with staging values

---

### 3. Domain Configuration

**Option A: Subdomain of ritual.net**
1. In Vercel: Add domain `research.ritual.net`
2. In DNS: Add CNAME record `research` → `cname.vercel-dns.com`
3. Vercel will auto-provision SSL

**Option B: Vercel subdomain (quick start)**
- Use default `ritual-research-graph.vercel.app`
- No DNS configuration needed

---

### 4. Supabase Production Config

**Update Google OAuth redirect URLs:**
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add Site URL: `https://research.ritual.net`
3. Add Redirect URL: `https://research.ritual.net/api/auth/callback`

**Update Google Cloud Console:**
1. Go to APIs & Services → Credentials
2. Edit OAuth 2.0 Client
3. Add authorized redirect URI: `https://research.ritual.net/api/auth/callback`

---

### 5. Vercel Blob Setup

**For microsite storage:**

1. In Vercel Dashboard → Storage → Create Database → Blob
2. Connect to project
3. Copy `BLOB_READ_WRITE_TOKEN` to environment variables

**Update microsite deployment in code:**
```typescript
import { put } from '@vercel/blob';

async function deployMicrosite(slug: string, buildDir: string) {
  // Upload built microsite to Blob
  const files = await readDir(buildDir);
  for (const file of files) {
    await put(`microsites/${slug}/${file.name}`, file.content, {
      access: 'public',
    });
  }
}
```

---

### 6. Microsite Proxy Route

**Create:** `apps/portal/src/app/sites/[slug]/[[...path]]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; path?: string[] } }
) {
  const { slug, path = [] } = params;
  const filePath = path.join('/') || 'index.html';

  // Fetch from Vercel Blob
  const blobUrl = `${process.env.BLOB_BASE_URL}/microsites/${slug}/${filePath}`;

  const response = await fetch(blobUrl);

  if (!response.ok) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Determine content type
  const contentType = getContentType(filePath);

  return new NextResponse(response.body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
```

---

### 7. CI/CD Configuration

**Automatic deploys:**
- Vercel auto-deploys on push to `main`
- Preview deploys on PRs

**vercel.json (optional):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

**GitHub Actions (optional, for additional checks):**
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      # Vercel handles actual deployment
```

---

### 8. Post-Deployment Verification

**Checklist:**

| Check | URL | Expected |
|-------|-----|----------|
| Portal loads | `https://research.ritual.net` | Dashboard renders |
| Auth works | Click "Sign in" | Google OAuth flow |
| API responds | `/api/microsites` | JSON response |
| Microsites load | `/sites/[slug]` | Static site renders |
| Realtime works | `/pipeline` | Updates appear live |
| Generation works | `/new` | Full flow completes |

---

## Rollback Plan

If deployment fails:

1. **Vercel rollback:**
   - Dashboard → Deployments → Select previous → Promote to Production

2. **Environment issues:**
   - Check Vercel logs: Dashboard → Deployments → [deployment] → Functions

3. **Database issues:**
   - Supabase handles its own availability
   - Check Supabase Dashboard → Logs

---

## Security Checklist

- [ ] All API keys in environment variables (not in code)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` only in server-side code
- [ ] Google OAuth restricted to @ritual.net
- [ ] RLS policies active on all tables
- [ ] No sensitive data in client-side code
- [ ] HTTPS enforced (Vercel default)

---

## Monitoring

**Vercel Analytics (optional):**
1. Enable in Vercel Dashboard → Analytics
2. Add `@vercel/analytics` package
3. Tracks page views, Web Vitals

**Error Tracking (optional):**
- Sentry integration available via Vercel

---

## Cost Considerations

**Vercel Hobby (free):**
- 100GB bandwidth
- Serverless function invocations: 100K
- Good for internal tool with <20 users

**Vercel Pro ($20/mo):**
- 1TB bandwidth
- 1M function invocations
- Team features
- Password protection (if needed)

**Recommendation:** Start with Hobby, upgrade if needed.

---

## Implementation Order

1. Create Vercel project
2. Configure environment variables
3. Test deployment (default domain)
4. Set up Vercel Blob
5. Implement microsite proxy route
6. Configure custom domain
7. Update Supabase OAuth URLs
8. Verify all functionality
9. Document any issues

---

*Spec created: 2026-01-16*
