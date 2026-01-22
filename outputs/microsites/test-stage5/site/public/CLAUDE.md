# Ritual Intelligence Microsite

## Overview

A reference dossier microsite for RWA (Real World Assets) + DeFi + AI analysis, built as a single-page React application. The site presents strategic intelligence for those building the intelligence layer of finance.

## Tech Stack

- **React 18** - UI framework (via CDN, no npm)
- **lucide-react** - Icon library
- **Babel standalone** - JSX transformation in browser
- **Inline styles** - No CSS files, all styling via React style objects
- **No build system** - Direct browser execution with script tags

## Design System (Making Software Aesthetic)

### Colors
- **Background:** `#FBFBFB` (off-white)
- **Text:** `#171717` (near-black)
- **Accent:** Cobalt blue scale (#F5F7FF to #2A4BC5)

### Typography
- **Headers:** SF Mono / Fira Code (monospace, uppercase)
- **Body:** Georgia / Iowan Old Style (serif)
- **Labels:** Monospace, 10px, uppercase, 50% opacity

### Key Patterns
- Figure numbers (FIG.001, FIG.002...)
- Dotted separators
- Left border accent callouts
- Two-column layouts

## File Structure

```
defi-rwa/
├── CLAUDE.md                    # This file
├── microsite/
│   ├── index.html               # Entry point (loads React via CDN)
│   └── index.jsx                # Full React app (ESM module version)
├── RitualIntelligenceMicrosite.jsx  # Complete component (duplicate of index.jsx)
│
├── # Source Documents (Raw .md files)
├── defi-rwa-transcript-raw.md        # Original transcript
├── defi-rwa-transcript-raw-updated.md # Updated transcript
├── RWA_DeFi_2026_Transcript_Clean.md # Cleaned transcript
├── RWA_DeFi_2026_Intelligence_Brief.md # Market intelligence
├── Twitter_Research_Notes_Matyv_2026_Narratives.md # @matyv_7 research
├── RWA_DeFi_Strategic_Questions_Explorations.md # Strategic Q&A
│
├── # Design Documentation
├── DESIGN_LIBRARY_MAKING_SOFTWARE.md # Design system reference
├── MICROSITE_DESIGN_PLAN.md          # Implementation plan
└── CONTENT_MODALITY_PLAN.md          # Content strategy
```

## Pages

1. **Home** - Landing page with core thesis, document cards, key stats
2. **Transcript** - 8-part conversation summary with sidebar navigation
3. **Intelligence** - Market analysis, search strings, protocol deep-dives
4. **Atlas** - 70+ project tier list with filtering
5. **Playbook** - 13 strategic questions with detailed analysis
6. **Archive** - Raw source documents (to be added)

## Data Structures

- `DOCUMENTS` - 4 document cards for landing page
- `TRANSCRIPT_PARTS` - 8 sections of conversation
- `PROJECTS` - 20+ projects with tier/category/ritual-opportunity
- `QUESTIONS` - 13 strategic questions with analysis
- `TIER_CONFIG` - S/A/B/C/D tier visualization

## Running the Site

```bash
# From project root
cd microsite
npx serve .
# Or
python -m http.server 8000
# Or with live reload
npx vite --config vite.config.js
```

Open `http://localhost:3000` (or 8000 for python)

## Key Insights

- RWA TVL: $35B+
- Projects tracked: 70+
- Core thesis: "The main bottleneck for AI agents is no longer intelligence—it's verifiability"
- Ritual primitives: ONNX, TEE, HTTP, Scheduled Tx, Secret Encryption
