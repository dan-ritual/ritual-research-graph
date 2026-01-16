# Ritual Research Graph

Transform meeting transcripts into interconnected, Wikipedia-style microsites with bi-directional entity linking.

## Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Core Types** | ✅ Implemented | Entity, Microsite, Opportunity types |
| **Graph Utilities** | ✅ Implemented | Registry, index manager |
| **Import Script** | ✅ Implemented | Can import existing microsites |
| **Processing Pipeline** | 🔲 Not Started | CLI-based generation |
| **Database** | 🔲 Not Started | Supabase setup |
| **Portal** | 🔲 Not Started | Next.js UI |
| **Graph UI** | 🔲 Not Started | Entity pages, navigation |
| **Spot Treatment** | 🔲 Not Started | Surgical artifact editing |

## Quick Start

```bash
# Clone and install
cd /Users/danielgosek/dev/projects/ritual/ritual-research-graph
npm install

# Import existing microsite (already done)
npm run import-microsite
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     RITUAL RESEARCH GRAPH                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐     ┌──────────┐     ┌──────────────────────┐    │
│  │  Portal  │────►│ Claude   │────►│     Microsites       │    │
│  │  (GUI)   │     │   API    │     │  (Static Sites)      │    │
│  └──────────┘     └──────────┘     └──────────────────────┘    │
│        │               │                    │                   │
│        └───────────────┴────────────────────┘                   │
│                        │                                        │
│                        ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Supabase                               │  │
│  │  Postgres │ Auth │ Realtime │ Storage (Vercel Blob)      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
ritual-research-graph/
├── inputs/                      # Source materials
│   └── transcripts/             # Meeting transcripts
│
├── outputs/                     # Generated artifacts
│   └── microsites/              # Generated microsites
│       └── rwa-defi-jan-2026/   # Example microsite
│
├── packages/
│   └── core/                    # Shared types and utilities
│       └── src/
│           ├── types.ts         # Entity, Microsite, Opportunity
│           ├── registry.ts      # Entity registry operations
│           └── index-manager.ts # Microsite index operations
│
├── data/                        # JSON data (pre-Supabase)
│   ├── entities.json            # Global entity registry
│   ├── index.json               # Microsite index
│   └── opportunities.json       # Opportunity taxonomy
│
├── docs/
│   ├── MASTER_SPEC.md           # Master specification
│   ├── specs/                   # Implementation specs
│   │   ├── SPEC_PROCESSING_PIPELINE.md
│   │   ├── SPEC_DATABASE_SCHEMA.md
│   │   └── SPEC_MULTI_AI_RESEARCH.md
│   └── design/                  # Design artifacts
│       ├── DESIGN_LIBRARY_MAKING_SOFTWARE.md
│       ├── MICROSITE_DESIGN_PLAN.md
│       └── CONTENT_MODALITY_PLAN.md
│
├── scripts/                     # Project scripts
│   └── import-existing.ts       # Import script
│
├── .claude/                     # Session continuity system
│   ├── handoffs/                # Session handoffs
│   ├── hooks/                   # Auto-handoff hooks
│   ├── scripts/                 # Handoff utilities
│   └── templates/               # Kickoff templates
│
├── CHANGELOG.md                 # Project changelog
└── README.md                    # This file
```

## Documentation

| Document | Purpose |
|----------|---------|
| [Master Spec](docs/MASTER_SPEC.md) | Architecture decisions, implementation phases |
| [Processing Pipeline](docs/specs/SPEC_PROCESSING_PIPELINE.md) | Artifact generation, multi-AI chain |
| [Database Schema](docs/specs/SPEC_DATABASE_SCHEMA.md) | Supabase schema, RLS policies |
| [Multi-AI Research](docs/specs/SPEC_MULTI_AI_RESEARCH.md) | Grok → Perplexity → bird-cli chain |
| [Design Library](docs/design/DESIGN_LIBRARY_MAKING_SOFTWARE.md) | Making Software aesthetic |
| [Changelog](CHANGELOG.md) | Version history, progress tracking |

## Key Features

### Implemented ✅

- **Entity Registry** — Track companies, protocols, people, concepts
- **Co-occurrence Graph** — Automatic relationship detection
- **Microsite Import** — Bring in existing microsites

### Planned 🔲

- **End-to-End Generation** — Transcript → Artifacts → Microsite
- **Multi-AI Research** — Grok + Perplexity + bird-cli for real-time research
- **Portal UI** — Web interface for contributors
- **Entity Pages** — Wikipedia-style aggregation
- **Spot Treatment** — Surgical artifact editing
- **Multiple Workflows** — Market Landscape, Internal Strategy, etc.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Database | Supabase (Postgres) |
| Auth | Google OAuth (@ritual.net) |
| Portal | Next.js (App Router) |
| Processing | Claude API (direct calls) |
| Storage | Vercel Blob |
| Hosting | Vercel |
| Microsites | React/Vite (static) |

## Implementation Phases

```
Phase 1a ──► Phase 1b ──► Phase 2 ──► Phase 3 ──► Phase 4
Database     Pipeline     Portal      Graph       Edit
(Supabase)   (CLI+AI)     (Next.js)   (UI)        (Spot)
   │            │            │           │           │
   ▼            ▼            ▼           ▼           ▼
Setup DB    Generate     Web UI     Navigate    Refine
+ Auth      w/ multi-AI  for gen    entities    content
```

> **Multi-AI Research Chain:** Pipeline uses Grok → Perplexity → bird-cli → Claude for real-time research

## Contributing

1. Read the [Master Spec](docs/MASTER_SPEC.md)
2. Check the relevant child spec for your area
3. Follow the implementation phase sequence
4. Update CHANGELOG.md with your changes

## License

Internal Ritual project. Not for public distribution.

---

*Last updated: 2026-01-16*
