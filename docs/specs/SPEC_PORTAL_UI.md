# Specification: Portal UI (Next.js)

**Parent:** [`MASTER_SPEC.md`](../MASTER_SPEC.md)
**Sequence:** Child Spec #4 of 8
**Phase:** 2 (Portal MVP)
**Status:** Ready for Implementation
**Created:** 2026-01-16
**Last Updated:** 2026-01-16

> **Elicitation Complete (2026-01-16):** All design decisions finalized. See [Elicitation Decisions](#11-elicitation-decisions) for full list.

---

## Overview

This specification details the Next.js portal application that provides a web UI for generating and browsing microsites. The portal wraps the existing CLI pipeline (Phase 1b) with a user-friendly interface.

### Deliverable

A web application at `research.ritual.net` where Ritual contributors can:
1. Upload transcripts and generate microsites
2. Monitor generation job progress
3. Browse and view generated microsites
4. Review and approve extracted entities

---

## Table of Contents

1. [Architecture](#1-architecture)
2. [Authentication](#2-authentication)
3. [Pages & Routes](#3-pages--routes)
4. [Generation Wizard](#4-generation-wizard)
5. [Job Status & Realtime](#5-job-status--realtime)
6. [Microsite Serving](#6-microsite-serving)
7. [Entity Review Flow](#7-entity-review-flow)
8. [UI Components](#8-ui-components)
9. [API Routes](#9-api-routes)
10. [Implementation Tasks](#10-implementation-tasks)
11. [Elicitation Decisions](#11-elicitation-decisions)

---

## 1. Architecture

### Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Next.js 14+ (App Router) | Best Vercel integration, server components |
| UI Library | shadcn/ui | Accessible, customizable, matches aesthetic |
| Styling | Tailwind CSS | Utility-first, shadcn/ui requirement |
| State | TanStack Query | Async state, caching, Supabase integration |
| Auth | Supabase Auth | Already configured, Google OAuth |
| Database | Supabase Postgres | Existing Phase 1a setup |
| Realtime | Supabase Realtime | Job status subscriptions |
| Storage | Vercel Blob | Microsite static files |

### Project Structure

```
apps/portal/                    # NEW: Portal application
├── package.json
├── next.config.js
├── tailwind.config.js
├── components.json             # shadcn/ui config
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Dashboard
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── new/
│   │   └── page.tsx            # Generation wizard
│   ├── jobs/
│   │   └── [id]/
│   │       └── page.tsx        # Job status
│   ├── microsites/
│   │   ├── page.tsx            # Microsite list
│   │   └── [slug]/
│   │       └── page.tsx        # Microsite detail
│   ├── sites/
│   │   └── [slug]/
│   │       └── [...path]/
│   │           └── route.ts    # Microsite proxy
│   └── api/
│       ├── auth/
│       │   └── callback/
│       │       └── route.ts    # OAuth callback
│       ├── generate/
│       │   └── route.ts        # Start generation
│       ├── jobs/
│       │   └── [id]/
│       │       ├── route.ts    # Job CRUD
│       │       └── retry/
│       │           └── route.ts
│       └── entities/
│           └── [id]/
│               └── approve/
│                   └── route.ts
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── page-header.tsx
│   ├── wizard/
│   │   ├── step-upload.tsx
│   │   ├── step-configure.tsx
│   │   └── step-review.tsx
│   ├── job/
│   │   ├── job-progress.tsx
│   │   ├── job-status-badge.tsx
│   │   └── entity-review.tsx
│   └── microsite/
│       ├── microsite-card.tsx
│       └── microsite-list.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── types.ts            # Generated types
│   ├── queries/
│   │   ├── jobs.ts             # TanStack Query hooks
│   │   ├── microsites.ts
│   │   └── entities.ts
│   └── utils.ts
└── public/
    └── ...
```

### Monorepo Integration

```json
// package.json (root) - updated workspaces
{
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

---

## 2. Authentication

### Google OAuth Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION FLOW                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. User visits portal                                                   │
│     └── Middleware checks session                                        │
│         └── No session? Redirect to /login                              │
│                                                                          │
│  2. /login page                                                          │
│     └── "Sign in with Google" button                                    │
│         └── supabase.auth.signInWithOAuth({ provider: 'google' })       │
│                                                                          │
│  3. Google OAuth                                                         │
│     └── User authenticates with Google account                          │
│         └── MUST be @ritual.net domain (enforced by Supabase)           │
│                                                                          │
│  4. Callback to /api/auth/callback                                       │
│     └── Exchange code for session                                        │
│         └── Auto-create user profile (trigger in Supabase)              │
│             └── Redirect to dashboard                                    │
│                                                                          │
│  5. Protected routes                                                     │
│     └── Middleware validates session on every request                   │
│         └── Session cookie managed by Supabase                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Middleware

```typescript
// apps/portal/middleware.ts

import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => response.cookies.set({ name, value, ...options }),
        remove: (name, options) => response.cookies.set({ name, value: '', ...options }),
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Public routes
  const publicPaths = ['/login', '/api/auth'];
  if (publicPaths.some(p => request.nextUrl.pathname.startsWith(p))) {
    return response;
  }

  // Redirect to login if no session
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 3. Pages & Routes

### Route Map

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Dashboard | Overview, recent jobs, stats |
| `/login` | Login | Google OAuth sign-in |
| `/new` | Generation Wizard | 3-step wizard for new research |
| `/jobs/[id]` | Job Status | Progress, entity review |
| `/microsites` | Microsite List | Browse all microsites |
| `/microsites/[slug]` | Microsite Detail | View metadata, edit |
| `/sites/[slug]/*` | Microsite Proxy | Serve static microsite |

### Dashboard (`/`)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  RITUAL RESEARCH GRAPH                            [User] ▼              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Welcome back, Dan                                                       │
│                                                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │  12             │  │  147            │  │  3              │         │
│  │  Microsites     │  │  Entities       │  │  In Progress    │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  [+ New Research]                                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Recent Jobs                                                             │
│  ─────────────────────────────────────────────────────────────────────  │
│  │ RWA × DeFi Jan 2026          │ Completed │ 2 hours ago │ View →    │ │
│  │ Tokenized Treasuries Q1      │ Running   │ 5 min ago   │ View →    │ │
│  │ Private Credit Analysis      │ Failed    │ 1 day ago   │ Retry →   │ │
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  Recent Microsites                                                       │
│  ─────────────────────────────────────────────────────────────────────  │
│  │ [Card] RWA × DeFi    │ [Card] AI Agents     │ [Card] ...          │ │
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Generation Wizard

### 3-Step Flow

```
Step 1: Upload          Step 2: Configure          Step 3: Review
    ●─────────────────────────○─────────────────────────○
    │                         │                         │
    │  Drag & drop or        │  Title: [............]  │  Summary of all
    │  paste transcript       │  Workflow: [dropdown▼]  │  settings
    │                         │  Accent: [color pick]   │
    │  ┌─────────────────┐   │                         │  ┌────────────────┐
    │  │                 │   │  Advanced ▼             │  │ Transcript:    │
    │  │   Drop file     │   │  └─ Skip build         │  │ rwa-defi.md    │
    │  │   or paste      │   │  └─ Skip research      │  │ Title: RWA×... │
    │  │                 │   │                         │  │ Workflow: ...  │
    │  └─────────────────┘   │                         │  └────────────────┘
    │                         │                         │
    │  [Next →]               │  [← Back] [Next →]      │  [← Back] [Submit]
```

### Step 1: Upload

```typescript
interface UploadStepProps {
  onComplete: (transcript: string, filename: string) => void;
}

// Features:
// - Drag & drop .md/.txt files
// - Paste directly (auto-detect markdown)
// - Preview first 500 chars
// - Validate: non-empty, reasonable length
```

### Step 2: Configure

```typescript
interface ConfigStepProps {
  transcript: string;
  onComplete: (config: GenerationConfig) => void;
}

interface GenerationConfig {
  title: string;           // e.g., "RITUAL INTELLIGENCE"
  subtitle?: string;       // e.g., "RWA × DeFi × AI · January 2026"
  workflow: 'market-landscape';  // Only option for v1
  accentColor: string;     // Hex color with preview
  advanced?: {
    skipBuild: boolean;    // Skip Vite build step
    skipResearch: boolean; // Skip Stage 2 (multi-AI research)
  };
}
```

### Step 3: Review

```typescript
interface ReviewStepProps {
  transcript: { content: string; filename: string };
  config: GenerationConfig;
  onSubmit: () => Promise<void>;
  onBack: () => void;
}

// Display:
// - Transcript filename and preview
// - All configuration options
// - Estimated time (rough)
// - "By submitting, generation will begin immediately"
```

---

## 5. Job Status & Realtime

### Job Status Page (`/jobs/[id]`)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard                                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  RWA × DeFi January 2026                                                │
│  Job ID: abc123-def456                                                   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Stage 3 of 6: Extracting Entities                              │   │
│  │  ████████████████████░░░░░░░░░░░░░░░░░░░░░░  45%                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Pipeline Stages                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│  ✓ Stage 1: Generate Artifacts            [4 files]          2:34      │
│  ✓ Stage 2: Multi-AI Research             [3 sources]        1:45      │
│  ● Stage 3: Extract Entities              [running...]       0:32      │
│  ○ Stage 4: Generate SITE_CONFIG          [waiting]          —         │
│  ○ Stage 5: Build Microsite               [waiting]          —         │
│  ○ Stage 6: Graph Integration             [waiting]          —         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  [Cancel Job]                                                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Realtime Subscription

```typescript
// lib/queries/jobs.ts

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

export function useJob(jobId: string) {
  const queryClient = useQueryClient();
  const supabase = createBrowserClient();

  // Initial fetch
  const query = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generation_jobs')
        .select('*, artifacts(*)')
        .eq('id', jobId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'generation_jobs',
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          queryClient.setQueryData(['job', jobId], payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, queryClient, supabase]);

  return query;
}
```

### Failed Job UI

When a job fails:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ⚠️  Generation Failed                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Error at Stage 3: Entity Extraction                                     │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Claude API Error: Rate limit exceeded. Please try again in     │   │
│  │  60 seconds.                                                    │   │
│  │                                                                  │   │
│  │  Error code: CLAUDE_RATE_LIMIT                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  [Retry from Stage 3]    [Start Over]    [View Partial Results]         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Microsite Serving

### Vercel Blob + Proxy Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      MICROSITE SERVING ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  User requests: research.ritual.net/sites/rwa-defi-jan-2026/            │
│                                                                          │
│       │                                                                  │
│       ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Next.js Catch-All Route: /sites/[slug]/[...path]               │   │
│  │                                                                  │   │
│  │  1. Check auth (internal microsites require login)              │   │
│  │  2. Look up microsite in Supabase → get blob_path               │   │
│  │  3. Proxy request to Vercel Blob                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│       │                                                                  │
│       ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Vercel Blob Storage                                            │   │
│  │                                                                  │   │
│  │  /microsites/rwa-defi-jan-2026/                                 │   │
│  │  ├── index.html                                                 │   │
│  │  ├── assets/                                                    │   │
│  │  │   ├── index-abc123.js                                       │   │
│  │  │   └── index-def456.css                                      │   │
│  │  └── *.md (artifacts)                                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Proxy Route

```typescript
// app/sites/[slug]/[...path]/route.ts

import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; path?: string[] } }
) {
  const { slug, path = [] } = params;
  const supabase = createServerClient();

  // 1. Auth check
  const { data: { session } } = await supabase.auth.getSession();

  // 2. Get microsite
  const { data: microsite } = await supabase
    .from('microsites')
    .select('blob_path, visibility')
    .eq('slug', slug)
    .single();

  if (!microsite) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // 3. Check visibility
  if (microsite.visibility === 'internal' && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. Proxy to Vercel Blob
  const filePath = path.length > 0 ? path.join('/') : 'index.html';
  const blobUrl = `${process.env.BLOB_URL}/${microsite.blob_path}/${filePath}`;

  const response = await fetch(blobUrl);

  return new NextResponse(response.body, {
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'text/html',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
```

---

## 7. Entity Review Flow

### Review Required State

When a job reaches `awaiting_entity_review` status:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ⏸️  Review Required                                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Stages 1-3 complete. Please review extracted entities before           │
│  continuing to graph integration.                                        │
│                                                                          │
│  Extracted Entities (24)                                                 │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  ☑ Ondo Finance         protocol    Tokenized Treasuries       │   │
│  │    Aliases: Ondo, ONDO                                          │   │
│  │    ⚠️ Possible match: "Ondo" (existing entity)                  │   │
│  │       [Merge ↗] [Keep Separate]                                 │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  ☑ Maple Finance        protocol    Private Credit             │   │
│  │    Aliases: Maple                                               │   │
│  │    ✓ New entity                                                 │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  ☐ tokenized treasuries concept     —                          │   │
│  │    ⚠️ Generic term - consider excluding                        │   │
│  │       [Include] [Exclude]                                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Selected: 22 of 24 entities                                            │
│                                                                          │
│  [Approve & Continue]                                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Entity Review API

```typescript
// POST /api/jobs/[id]/approve-entities
interface ApproveEntitiesRequest {
  approvedEntityIds: string[];    // UUIDs of entities to include
  merges: Array<{
    extractedId: string;
    existingSlug: string;         // Merge into existing entity
  }>;
}
```

---

## 8. UI Components

### Design System (Making Software Aesthetic)

```typescript
// tailwind.config.js

const config = {
  theme: {
    extend: {
      colors: {
        // Making Software palette
        background: '#FAFAFA',
        foreground: '#1A1A1A',
        muted: '#F5F5F5',
        'muted-foreground': '#737373',
        border: '#E5E5E5',
        accent: {
          DEFAULT: '#3B5FE6',
          foreground: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
};
```

### Core Components (shadcn/ui)

Install these shadcn/ui components:

```bash
npx shadcn@latest add button card input label select textarea
npx shadcn@latest add dialog dropdown-menu popover
npx shadcn@latest add table badge progress
npx shadcn@latest add form checkbox radio-group
npx shadcn@latest add toast sonner
```

### Custom Components

```typescript
// components/wizard/wizard-shell.tsx
interface WizardShellProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  children: React.ReactNode;
}

// components/job/stage-indicator.tsx
interface StageIndicatorProps {
  stage: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  label: string;
  duration?: number;  // seconds
  details?: string;
}

// components/microsite/microsite-card.tsx
interface MicrositeCardProps {
  microsite: {
    slug: string;
    title: string;
    subtitle: string;
    thesis: string;
    entityCount: number;
    createdAt: string;
  };
}
```

---

## 9. API Routes

### Generate API

```typescript
// app/api/generate/route.ts

import { createServerClient } from '@/lib/supabase/server';
import { spawn } from 'child_process';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  // 1. Auth check
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { transcript, config } = body;

  // 2. Create job record
  const { data: job, error } = await supabase
    .from('generation_jobs')
    .insert({
      user_id: session.user.id,
      workflow_type: config.workflow,
      status: 'pending',
      config: config,
      transcript_path: '', // Will be set after upload
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 3. Upload transcript to Supabase Storage
  const transcriptPath = `${session.user.id}/${job.id}.md`;
  await supabase.storage
    .from('transcripts')
    .upload(transcriptPath, transcript);

  // 4. Update job with transcript path
  await supabase
    .from('generation_jobs')
    .update({ transcript_path: transcriptPath })
    .eq('id', job.id);

  // 5. Spawn CLI process in background
  const cliProcess = spawn('npm', [
    'run', 'generate', '--',
    '--job-id', job.id,
    '--workflow', config.workflow,
    '--title', config.title,
    '--accent', config.accentColor,
  ], {
    cwd: process.env.PROJECT_ROOT,
    detached: true,
    stdio: 'ignore',
  });

  cliProcess.unref();

  return NextResponse.json({ jobId: job.id });
}
```

### Jobs API

```typescript
// app/api/jobs/[id]/route.ts - GET job status
// app/api/jobs/[id]/retry/route.ts - POST retry from failed stage
// app/api/jobs/[id]/cancel/route.ts - POST cancel running job
```

### Entities API

```typescript
// app/api/entities/[id]/approve/route.ts - POST approve entities
// app/api/entities/merge/route.ts - POST merge entities
```

---

## 10. Implementation Tasks

### Phase 2 Checklist

| # | Task | Priority | Dependency |
|---|------|----------|------------|
| 1 | Create `apps/portal` Next.js project | P0 | — |
| 2 | Configure shadcn/ui + Tailwind | P0 | #1 |
| 3 | Configure TanStack Query provider | P0 | #1 |
| 4 | Set up Supabase auth (client + server) | P0 | #1 |
| 5 | Create auth middleware | P0 | #4 |
| 6 | Build Login page | P0 | #4 |
| 7 | Build Dashboard page | P0 | #5 |
| 8 | Build Generation Wizard (3 steps) | P0 | #7 |
| 9 | Create `/api/generate` route | P0 | #8 |
| 10 | Build Job Status page | P0 | #9 |
| 11 | Add Supabase Realtime subscription | P0 | #10 |
| 12 | Build Entity Review component | P0 | #10 |
| 13 | Build Microsite List page | P0 | #7 |
| 14 | Build Microsite Detail page | P1 | #13 |
| 15 | Implement microsite proxy route | P1 | #14 |
| 16 | Add Vercel Blob upload in CLI | P1 | #15 |
| 17 | Add soft delete for microsites | P2 | #14 |
| 18 | Add retry/cancel job functionality | P2 | #10 |

### Environment Variables

```bash
# apps/portal/.env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_...
BLOB_URL=https://xxx.blob.vercel-storage.com

# CLI
PROJECT_ROOT=/path/to/ritual-research-graph
```

---

## 11. Elicitation Decisions

All decisions made during Phase 2 kickoff elicitation (2026-01-16):

| Category | Question | Decision |
|----------|----------|----------|
| UI Library | Which component library? | **shadcn/ui** — accessible, customizable, matches aesthetic |
| Job Updates | How to show progress? | **Supabase Realtime** — already configured, instant updates |
| Job Trigger | How to start generation? | **API route → spawn CLI** — reuses existing pipeline |
| Site Hosting | Where to serve microsites? | **Vercel Blob + proxy** — single deployment, auth check |
| State Mgmt | Client state approach? | **TanStack Query** — async state, caching, Supabase integration |
| MVP Priority | Page build order? | **Generation-first** — Dashboard → Wizard → Status → List |
| Entity Review | When to review? | **Before graph write** — job pauses at `awaiting_entity_review` |
| Theme | Dark mode support? | **Light only for MVP** — matches Making Software aesthetic |
| Repo Structure | Where in codebase? | **apps/portal in monorepo** — shares types from packages/core |
| Wizard Steps | How many steps? | **3 steps** — Upload → Configure → Review |
| Admin Pages | Include admin? | **Skip for MVP** — all @ritual.net users equal in v1 |
| Design Reference | Visual style? | **Making Software aesthetic** — clean, institutional, minimal |
| Failure UX | Job failure handling? | **Show error + retry button** — user stays in flow |
| Delete Action | Can users delete? | **Soft delete (archive)** — hide from list, can restore |

---

## Related Specifications

| Spec | Relationship |
|------|--------------|
| [`MASTER_SPEC.md`](../MASTER_SPEC.md) | Parent specification |
| [`SPEC_DATABASE_SCHEMA.md`](./SPEC_DATABASE_SCHEMA.md) | Database tables used by portal |
| [`SPEC_PROCESSING_PIPELINE.md`](./SPEC_PROCESSING_PIPELINE.md) | CLI invoked by portal API |
| [`SPEC_PORTAL_DESIGN_OVERHAUL.md`](./SPEC_PORTAL_DESIGN_OVERHAUL.md) | **Visual design spec — Making Software aesthetic implementation** |
| `SPEC_GRAPH_UI.md` | Phase 3 — extends entity browsing |
| `SPEC_SPOT_TREATMENT.md` | Phase 4 — extends editing capabilities |

---

## Design System Reference

> **IMPORTANT:** All portal UI work MUST follow the Making Software aesthetic. See [`SPEC_PORTAL_DESIGN_OVERHAUL.md`](./SPEC_PORTAL_DESIGN_OVERHAUL.md) for the canonical design tokens, patterns, and implementation checklist.

The design system is documented in:
1. **[`docs/design/DESIGN_LIBRARY_MAKING_SOFTWARE.md`](../design/DESIGN_LIBRARY_MAKING_SOFTWARE.md)** — Full design library
2. **[`SPEC_PORTAL_DESIGN_OVERHAUL.md`](./SPEC_PORTAL_DESIGN_OVERHAUL.md)** — Portal-specific implementation with elicitation decisions
3. **`outputs/microsites/rwa-defi-jan-2026/src/App.jsx`** — Reference implementation

Any new portal components or pages must align with these specifications before merging.

---

*Specification created as part of Ritual Research Graph project.*
*See [`MASTER_SPEC.md`](../MASTER_SPEC.md) for full project context.*
