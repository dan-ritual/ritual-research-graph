# SPEC_1_MODE_SYSTEM: Mode Abstraction Layer

> **Status:** Ready for Implementation
> **Phase:** 1
> **Dependencies:** Phase 0 Audit Complete ✅
> **Blocks:** All subsequent phases
> **Effort:** 10 days (from audit estimate)

---

## Overview

Extract the mode abstraction layer that allows Ritual OS to operate in Growth, Engineering, or Skunkworks mode with shared infrastructure but mode-specific configurations.

---

## Elicitation Decisions Applied

| Decision | Value | Rationale |
|----------|-------|-----------|
| Entity type source | **TypeScript config files** | Type-safe, simpler, future DB migration path documented |
| Config format | **TypeScript** (not JSON) | Full type safety, IDE support, can include Zod schemas |
| Lazy loading | **No** | Keep simple for Phase 1, optimize later if needed |

---

## Win Conditions

- [ ] Mode can be switched via URL path (`/growth/*`, `/engineering/*`)
- [ ] Mode configuration loaded from TypeScript config files
- [ ] New entity types can be added by editing config file (code deploy required)
- [ ] Pipeline stages configurable per mode via config
- [ ] All existing Growth functionality preserved (zero regression)

---

## Satisfaction Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Mode switching latency | Time to switch modes | < 100ms |
| Config-driven entities | Entity types defined in config | 100% |
| Zero regression | Existing tests pass | 100% |
| Code coupling | Mode-specific code isolated | No cross-mode imports |

---

## Scope Boundaries

**In Scope:**
- ModeConfig TypeScript interface
- Mode configuration files (`packages/core/src/modes/*.config.ts`)
- Mode context provider (React)
- URL-based mode routing
- Mode-aware API routes
- Mode selector landing page

**Out of Scope:**
- Theme system (see SPEC_1_THEME_SYSTEM.md)
- Database schema changes (see SPEC_1_SCHEMA_SPLIT.md)
- Individual mode implementations (Phase 2+)
- Cross-mode linking (Phase 4)
- DB-driven entity types (see SPEC_FUTURE_DB_ENTITIES.md)

---

## Technical Approach

### Mode Configuration Structure

```typescript
// packages/core/src/modes/types.ts
export type ModeId = 'growth' | 'engineering' | 'product';

export interface ModeConfig {
  id: ModeId;
  name: string;                    // "Ritual Growth"
  shortName: string;               // "Growth"
  color: string;                   // "#3B5FE6"
  colorLight: string;              // "#E8EDFC"

  entityTypes: EntityTypeConfig[];
  pipelineStages: StageConfig[];
  navigation: NavConfig;

  features: {
    crossLinking: boolean;         // Always manual for now
    externalIntegrations: string[];
  };
}

export interface EntityTypeConfig {
  type: string;                    // 'company', 'feature', 'idea'
  displayName: string;             // 'Company'
  displayNamePlural: string;       // 'Companies'
  icon: string;                    // Lucide icon name
  fields: FieldConfig[];
  searchableFields: string[];
}

export interface FieldConfig {
  id: string;
  label: string;
  type: 'string' | 'text' | 'url' | 'enum' | 'date' | 'number';
  required: boolean;
  options?: string[];              // For enum type
}

export interface StageConfig {
  id: string;
  name: string;
  handler: string;                 // Module path: 'scripts/stages/artifacts'
  provider: 'claude' | 'grok' | 'perplexity' | 'bird' | 'internal';
  required: boolean;
  order: number;
  config?: Record<string, unknown>;
}

export interface NavConfig {
  items: NavItem[];
  defaultPath: string;
}

export interface NavItem {
  label: string;
  path: string;                    // Relative to mode, e.g., '/entities'
  icon: string;
}
```

### Mode Config Files

```typescript
// packages/core/src/modes/growth.config.ts
import { ModeConfig } from './types';

export const growthConfig: ModeConfig = {
  id: 'growth',
  name: 'Ritual Growth',
  shortName: 'Growth',
  color: '#3B5FE6',
  colorLight: '#E8EDFC',

  entityTypes: [
    {
      type: 'company',
      displayName: 'Company',
      displayNamePlural: 'Companies',
      icon: 'Building2',
      fields: [
        { id: 'name', label: 'Name', type: 'string', required: true },
        { id: 'sector', label: 'Sector', type: 'enum', required: false, options: ['DeFi', 'Infrastructure', 'Gaming', 'AI'] },
        { id: 'website', label: 'Website', type: 'url', required: false },
        { id: 'description', label: 'Description', type: 'text', required: false },
      ],
      searchableFields: ['name', 'sector', 'description'],
    },
    {
      type: 'protocol',
      displayName: 'Protocol',
      displayNamePlural: 'Protocols',
      icon: 'Boxes',
      fields: [
        { id: 'name', label: 'Name', type: 'string', required: true },
        { id: 'chain', label: 'Chain', type: 'enum', required: false, options: ['Ethereum', 'Solana', 'Polygon', 'Other'] },
        { id: 'tvl', label: 'TVL', type: 'string', required: false },
        { id: 'token', label: 'Token', type: 'string', required: false },
      ],
      searchableFields: ['name', 'chain'],
    },
    // ... person, opportunity types
  ],

  pipelineStages: [
    { id: 'artifacts', name: 'Artifacts', handler: 'scripts/stages/artifacts', provider: 'claude', required: true, order: 1 },
    { id: 'research', name: 'Research Chain', handler: 'scripts/stages/research', provider: 'grok', required: false, order: 2 },
    { id: 'entities', name: 'Entity Extraction', handler: 'scripts/stages/entities', provider: 'claude', required: true, order: 3 },
    { id: 'site-config', name: 'Site Config', handler: 'scripts/stages/site-config', provider: 'claude', required: true, order: 4 },
    { id: 'microsite', name: 'Microsite Build', handler: 'scripts/stages/microsite', provider: 'internal', required: true, order: 5 },
    { id: 'graph', name: 'Graph Integration', handler: 'scripts/stages/graph', provider: 'internal', required: false, order: 6 },
  ],

  navigation: {
    defaultPath: '/dashboard',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
      { label: 'Microsites', path: '/microsites', icon: 'FileText' },
      { label: 'Entities', path: '/entities', icon: 'Users' },
      { label: 'Pipeline', path: '/pipeline', icon: 'GitBranch' },
    ],
  },

  features: {
    crossLinking: true,
    externalIntegrations: ['bird-cli', 'perplexity', 'grok'],
  },
};
```

### Mode Registry

```typescript
// packages/core/src/modes/index.ts
import { growthConfig } from './growth.config';
import { engineeringConfig } from './engineering.config';
import { productConfig } from './product.config';
import { ModeConfig, ModeId } from './types';

const modeConfigs: Record<ModeId, ModeConfig> = {
  growth: growthConfig,
  engineering: engineeringConfig,
  product: productConfig,
};

export function getModeConfig(modeId: ModeId): ModeConfig {
  const config = modeConfigs[modeId];
  if (!config) {
    throw new Error(`Unknown mode: ${modeId}`);
  }
  return config;
}

export function getAllModes(): ModeConfig[] {
  return Object.values(modeConfigs);
}

export function getEntityTypeConfig(modeId: ModeId, entityType: string) {
  const config = getModeConfig(modeId);
  return config.entityTypes.find(et => et.type === entityType);
}
```

### Mode Context Provider

```typescript
// apps/portal/src/contexts/ModeContext.tsx
'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { getModeConfig, ModeConfig, ModeId } from '@ritual/core/modes';

interface ModeContextValue {
  modeId: ModeId | null;
  config: ModeConfig | null;
  isLoading: boolean;
}

const ModeContext = createContext<ModeContextValue>({
  modeId: null,
  config: null,
  isLoading: true,
});

export function ModeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const { modeId, config } = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const possibleMode = segments[0] as ModeId;

    if (['growth', 'engineering', 'product'].includes(possibleMode)) {
      return {
        modeId: possibleMode,
        config: getModeConfig(possibleMode),
      };
    }

    return { modeId: null, config: null };
  }, [pathname]);

  return (
    <ModeContext.Provider value={{ modeId, config, isLoading: false }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}

export function useModeConfig() {
  const { config } = useMode();
  if (!config) {
    throw new Error('useModeConfig must be used within a mode route');
  }
  return config;
}
```

### URL Routing Pattern

```
/                           → Mode selector (landing page)
/growth                     → Growth mode dashboard (redirect to /growth/dashboard)
/growth/dashboard           → Growth dashboard
/growth/microsites          → Growth microsites list
/growth/microsites/[slug]   → Growth microsite detail
/growth/entities            → Growth entities list
/growth/entities/[id]       → Growth entity detail
/growth/pipeline            → Growth pipeline/CRM view
/engineering                → Engineering mode dashboard
/engineering/wiki           → Engineering wiki
/engineering/features       → Engineering features
/engineering/decisions      → Engineering decision log
/product                    → Skunkworks mode (placeholder)
```

### Next.js Route Structure

```
apps/portal/src/app/
├── page.tsx                        # Mode selector landing
├── layout.tsx                      # Root layout (no mode)
├── [mode]/                         # Dynamic mode segment
│   ├── layout.tsx                  # Mode layout (applies theme, nav)
│   ├── page.tsx                    # Mode dashboard (redirect)
│   ├── dashboard/page.tsx          # Mode-specific dashboard
│   ├── entities/
│   │   ├── page.tsx                # Entity list (uses mode config)
│   │   └── [id]/page.tsx           # Entity detail
│   └── ... (mode-specific routes)
└── api/
    └── [mode]/                     # Mode-scoped API routes
        ├── entities/route.ts
        └── ...
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `packages/core/src/modes/types.ts` | Create | Mode system types |
| `packages/core/src/modes/growth.config.ts` | Create | Growth mode config |
| `packages/core/src/modes/engineering.config.ts` | Create | Engineering mode config (placeholder) |
| `packages/core/src/modes/product.config.ts` | Create | Product mode config (placeholder) |
| `packages/core/src/modes/index.ts` | Create | Mode registry |
| `apps/portal/src/contexts/ModeContext.tsx` | Create | Mode context provider |
| `apps/portal/src/app/layout.tsx` | Modify | Add ModeProvider |
| `apps/portal/src/app/page.tsx` | Modify | Mode selector landing |
| `apps/portal/src/app/[mode]/layout.tsx` | Create | Mode layout |
| `apps/portal/src/app/[mode]/dashboard/page.tsx` | Create | Mode dashboard |
| `apps/portal/src/components/layout/header.tsx` | Modify | Mode-aware nav |

---

## Migration Strategy

### Step 1: Create mode system (no breaking changes)

1. Create `packages/core/src/modes/` with types and configs
2. Create ModeContext but don't use it yet
3. Add engineering and product placeholder configs

### Step 2: Add mode routing

1. Create `/[mode]/` route structure
2. Add mode layout with ModeProvider
3. Create mode selector landing page

### Step 3: Migrate existing routes

1. Move `/microsites` to `/growth/microsites`
2. Move `/entities` to `/growth/entities`
3. Move `/pipeline` to `/growth/pipeline`
4. Add redirects from old routes

### Step 4: Update components

1. Update Header to use mode config for nav
2. Update entity components to use mode entity types
3. Remove hardcoded entity type references

---

## Testing Strategy

- Unit tests for mode config loading
- Unit tests for ModeContext
- Integration tests for mode switching
- E2E tests for route-based mode detection
- Regression tests for existing Growth functionality

---

## Rollback Plan

If mode system causes issues:
1. Revert route changes (keep `/microsites` etc.)
2. Remove ModeProvider from layout
3. Hardcode Growth config where needed
4. Preserve data (no schema changes in this spec)
