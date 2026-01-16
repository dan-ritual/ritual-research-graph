# SPEC: Portal Route Group Migration

**Status:** DRAFT (Future Phase)
**Parent:** SPEC_PORTAL_DESIGN_OVERHAUL.md
**Created:** 2026-01-16

---

## Overview

Migrate the portal from duplicated layout patterns to Next.js 14+ route groups for cleaner architecture and reduced boilerplate.

### Current State

The portal has three layout patterns:

1. **Authenticated Server Pages** (dashboard, microsites, microsite detail)
   - Use `AuthenticatedLayout` wrapper (created in Phase 1)
   - Full header with user avatar, nav links

2. **Client-side Pages** (new, jobs/[id])
   - Inline header with brand link only
   - No user info (would require client-side auth)

3. **Public Pages** (login)
   - Minimal layout, no header

### Target Architecture

```
src/app/
├── (auth)/                    # Authenticated route group
│   ├── layout.tsx             # AuthenticatedLayout (server-side)
│   ├── page.tsx               # Dashboard
│   ├── microsites/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   └── ...
├── (wizard)/                  # Client-side wizard flow
│   ├── layout.tsx             # ClientLayout with simple header
│   ├── new/page.tsx
│   └── jobs/[id]/
│       ├── page.tsx
│       └── review/page.tsx
└── (public)/                  # Public route group
    ├── layout.tsx             # Minimal/no header
    └── login/page.tsx
```

---

## Requirements

### R1: Route Group Layout Structure

1. Create `(auth)` route group with `AuthenticatedLayout`
2. Create `(wizard)` route group with `ClientLayout`
3. Create `(public)` route group for unauthenticated pages

### R2: ClientLayout Component

Create a client-side layout component for wizard pages:

```typescript
// src/components/layout/client-layout.tsx
"use client";

interface ClientLayoutProps {
  children: React.ReactNode;
  maxWidth?: "3xl" | "4xl" | "7xl";
}

export function ClientLayout({ children, maxWidth = "3xl" }: ClientLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FBFBFB]">
      <header className="border-b border-[rgba(0,0,0,0.08)] bg-white">
        <div className="flex h-16 items-center px-6">
          <Link
            href="/"
            className="font-display font-semibold text-lg text-[#3B5FE6] tracking-tight"
          >
            Ritual Research Graph
          </Link>
        </div>
      </header>
      <main className={`p-6 mx-auto max-w-${maxWidth}`}>
        {children}
      </main>
    </div>
  );
}
```

### R3: Migration Checklist

- [ ] Create route group directories
- [ ] Create group-specific layout.tsx files
- [ ] Move pages into appropriate groups
- [ ] Remove layout boilerplate from individual pages
- [ ] Update any hardcoded links that reference old paths
- [ ] Verify middleware still works with route groups
- [ ] Test all navigation flows

---

## Implementation Notes

### URL Preservation

Route groups like `(auth)` don't affect URLs. Moving `page.tsx` to `(auth)/page.tsx` keeps it at `/`.

### Middleware Considerations

The existing Supabase middleware should work unchanged since route groups don't affect URL patterns.

### Client vs Server Boundary

The key constraint is that `AuthenticatedLayout` is an async Server Component. Pages that need to be client components (like the wizard) can't use it directly, hence the separate `(wizard)` group with `ClientLayout`.

---

## Dependencies

- Phase 1 Quick Wins complete (AuthenticatedLayout, constants, StatusBadge, MicrositeCard)
- All current pages working with new abstractions

---

## Effort Estimate

- Route group creation: ~1 hour
- ClientLayout component: ~30 min
- Page migrations: ~1 hour
- Testing: ~30 min

**Total: ~3 hours**

---

## Success Criteria

1. All pages render correctly after migration
2. No layout code duplication in page components
3. Adding a new authenticated page requires no layout boilerplate
4. Build and tests pass
