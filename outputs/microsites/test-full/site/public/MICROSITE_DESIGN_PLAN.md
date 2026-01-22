# Microsite Design Plan
## RWA × DeFi × AI: Ritual Intelligence Report 2026

---

# Executive Summary

This microsite will serve as an internal intelligence hub for Ritual's RWA/DeFi strategic research. The design philosophy centers on **"Intelligent Money"** — reflecting Ritual's position as the intelligence layer for on-chain finance.

**Tech Stack Recommendation:** React + Tailwind CSS (single-page application with client-side routing)
- Component reusability for complex UI patterns
- Tailwind's utility-first approach for rapid, consistent styling
- No backend required — all content rendered from markdown/JSON
- Can be deployed as static site (Vercel, Netlify, or IPFS for decentralization)

---

# Content Architecture & Presentation Strategy

## Document Inventory

| Document | Lines | Content Type | Recommended Format |
|----------|-------|--------------|-------------------|
| **Transcript** | 339 | Conversational, sequential | Long-form article with speaker cards |
| **Intelligence Brief** | 890 | Technical reference, tables | Documentation hub with sidebar nav |
| **Twitter Research** | 466 | Project catalog, tier lists | Interactive dashboard with filters |
| **Strategic Questions** | 880 | Deep explorations, diagrams | Card-based slideshow/playbook |

---

# Visual Identity

## Color Palette (Dark Mode Default)

```
Background Layers:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Base:        #050508  (near black)
  Surface-1:   #0d0d14  (elevated cards)
  Surface-2:   #14141f  (interactive elements)
  Surface-3:   #1a1a2e  (hover states)

Primary Gradient:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  From:        #6366f1  (indigo-500)
  Via:         #8b5cf6  (violet-500)
  To:          #a855f7  (purple-500)

Accent Colors:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Cyan:        #06b6d4  (data highlights, links)
  Emerald:     #10b981  (success, S-tier)
  Amber:       #f59e0b  (warnings, A-tier)
  Rose:        #f43f5e  (critical, alerts)

Text Hierarchy:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Primary:     #f8fafc  (slate-50)
  Secondary:   #94a3b8  (slate-400)
  Muted:       #64748b  (slate-500)
  Code:        #e2e8f0  (slate-200) on #1e1e2e
```

## Typography

```
Headers:      Space Grotesk (geometric, technical feel)
              Weights: 500, 600, 700

Body:         Inter (excellent readability)
              Weights: 400, 500, 600

Code:         JetBrains Mono (ligatures, clear distinction)
              Weight: 400

Sizes:
  Hero:       72px / 80px line-height
  H1:         48px / 56px
  H2:         32px / 40px
  H3:         24px / 32px
  Body:       16px / 26px
  Small:      14px / 22px
  Code:       14px / 24px
```

---

# Page-by-Page Design Specification

## 1. Landing Page — "Command Center"

### Hero Section
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│     ◈ RITUAL INTELLIGENCE                                       │
│                                                                 │
│     RWA × DeFi × AI                                             │
│     ━━━━━━━━━━━━━━━━━                                          │
│     Strategic Research Report                                   │
│     January 2026                                                │
│                                                                 │
│     [Animated gradient mesh background with subtle              │
│      particle system suggesting data/intelligence flow]         │
│                                                                 │
│     Quick Stats Bar:                                            │
│     ┌─────────┬─────────┬─────────┬─────────┐                  │
│     │ $35B+   │ 70+     │ 13      │ S-Tier  │                  │
│     │ RWA TVL │ Projects│ Questions│ AI+RWA  │                  │
│     └─────────┴─────────┴─────────┴─────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Navigation Cards
Four primary cards arranged in a 2×2 grid (desktop) or stacked (mobile):

```
┌─────────────────────────────┐  ┌─────────────────────────────┐
│  📜 THE CONVERSATION        │  │  🔬 MARKET INTELLIGENCE     │
│  ─────────────────────      │  │  ─────────────────────      │
│  Internal strategy meeting  │  │  Operator-grade analysis    │
│  transcript with full Q&A   │  │  with deep search strings   │
│                             │  │                             │
│  Speakers: 12               │  │  Sections: 11               │
│  Topics: 8                  │  │  Protocols: 50+             │
│                             │  │                             │
│  [Read Transcript →]        │  │  [Explore Data →]           │
└─────────────────────────────┘  └─────────────────────────────┘

┌─────────────────────────────┐  ┌─────────────────────────────┐
│  🌐 NARRATIVE ATLAS         │  │  ⚡ STRATEGIC PLAYBOOK      │
│  ─────────────────────      │  │  ─────────────────────      │
│  2026 market narratives     │  │  13 critical questions      │
│  & project intelligence     │  │  with technical deep-dives  │
│                             │  │                             │
│  Tiers: S/A/B/C/D           │  │  Architecture diagrams: 8   │
│  Projects: 70+              │  │  Code examples: 12          │
│                             │  │                             │
│  [View Atlas →]             │  │  [Enter Playbook →]         │
└─────────────────────────────┘  └─────────────────────────────┘
```

### Key Insights Ticker
Horizontally scrolling bar with critical insights:
- "Verifiability is the bottleneck for AI agents"
- "This cycle rewards proof, not belief"
- "Privacy will be the most important moat"
- "RWA: $5B → $20B in 2025"

---

## 2. Transcript Page — "The Conversation"

### Design Philosophy
Treat this as a **long-form article** with emphasis on readability and speaker attribution. Think: high-quality podcast transcript meets academic paper.

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Command Center                                       │
│                                                                 │
│  THE CONVERSATION                                               │
│  RWA + DeFi '26 Overview                                        │
│  January 15, 2026 · Internal Strategy Meeting                   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PARTICIPANTS                                                   │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                    │
│  │ AP │ │ WL │ │ JY │ │ NP │ │ JS │ │ +7 │                    │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘                    │
│  Akilesh Wally  Junyi  Niraj  ...                              │
│                                                                 │
├───────────────────────┬─────────────────────────────────────────┤
│  TABLE OF CONTENTS    │                                         │
│  ─────────────────    │  PART 1: MARKET CONTEXT                 │
│                       │  ═══════════════════════                │
│  ○ Market Context     │                                         │
│  ○ Catalysts          │  ┌──────────────────────────────────┐  │
│  ○ RWA Limitations    │  │  WL  Wally                        │  │
│  ○ AI Opportunity     │  │  ──────────────────────────────   │  │
│  ○ Protocol Landscape │  │  Tokenized assets now exceed      │  │
│  ○ Deep Dives         │  │  $35 billion in total value...    │  │
│  ● Q&A Discussion     │  └──────────────────────────────────┘  │
│    ├ Self-Repaying    │                                         │
│    ├ Parcl/Positive   │  ┌──────────────────────────────────┐  │
│    ├ PerpDEX Ideas    │  │  AP  Akilesh                      │  │
│    └ Future Work      │  │  ──────────────────────────────   │  │
│                       │  │  The Parcl stuff you mentioned    │  │
│                       │  │  is interesting. When you think   │  │
│                       │  │  about the physical real estate...│  │
│                       │  └──────────────────────────────────┘  │
│                       │                                         │
└───────────────────────┴─────────────────────────────────────────┘
```

### Speaker Card Component
```jsx
<SpeakerCard>
  <Avatar initials="AP" color="violet" />
  <SpeakerName>Akilesh</SpeakerName>
  <Timestamp>Part 8 · Q&A Discussion</Timestamp>
  <Content>
    {markdown content with proper formatting}
  </Content>
</SpeakerCard>
```

### Features
- Sticky table of contents on desktop (left sidebar)
- Speaker color coding for visual tracking
- Expandable/collapsible sections
- "Jump to Q&A" quick action
- Keyboard navigation (J/K for next/prev section)

---

## 3. Intelligence Brief — "Market Intelligence"

### Design Philosophy
This is the **technical documentation hub** — think Stripe Docs meets Bloomberg Terminal. Dense information presented with clear hierarchy and powerful navigation.

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back     MARKET INTELLIGENCE     🔍 Search...    [Export]    │
├───────────────────────┬─────────────────────────────────────────┤
│                       │                                         │
│  SECTIONS             │  SECTION 5: PROTOCOL DEEP DIVES        │
│  ═════════════════    │  ═══════════════════════════════════   │
│                       │                                         │
│  1. Historical Context│  5.1 Zivoe: Self-Repaying Credit       │
│  2. Macro Catalysts   │  ─────────────────────────────────      │
│  3. Institutional     │                                         │
│  4. Infrastructure    │  ┌─────────────────────────────────┐   │
│  ● 5. Protocol Dives  │  │  PROTOCOL CARD                  │   │
│     ├ 5.1 Zivoe       │  │  ┌─────┬───────────────────────┤   │
│     ├ 5.2 Credix      │  │  │     │ Zivoe                 │   │
│     └ 5.3 Others      │  │  │ TVL │ ~$6M                  │   │
│  6. AI/Intelligence   │  │  │     │ Yield: 3.6% APY       │   │
│  7. KOLs & Sources    │  │  │     │ Utilization: 95%      │   │
│  8. Search Strings    │  │  └─────┴───────────────────────┘   │
│  9. 2026 Narratives   │  │                                     │
│  10. Internal Insights│  │  Category: Merchant Cash Advance    │
│  11. Primitive Mapping│  │  Chain: Ethereum                    │
│                       │  │  Mechanism: Revenue-based repayment │
│  APPENDICES           │  └─────────────────────────────────┘   │
│  ─────────            │                                         │
│  A. Glossary          │  STRUCTURAL COMPARISON                  │
│  B. Quick Reference   │  ┌──────────┬──────────┬──────────┐   │
│                       │  │ Feature  │ Trad.    │ Zivoe    │   │
│                       │  ├──────────┼──────────┼──────────┤   │
│                       │  │ Repayment│ Fixed    │ % Revenue│   │
│                       │  │ Default  │ Binary   │ Elastic  │   │
│                       │  │ Idle Cap │ No       │ Minimal  │   │
│                       │  └──────────┴──────────┴──────────┘   │
│                       │                                         │
│                       │  DEEP SEARCH STRINGS                    │
│                       │  ┌─────────────────────────────────┐   │
│                       │  │ "Zivoe" "spigot mechanism"      │ ⎘ │
│                       │  │ "merchant cash advance" DeFi    │ ⎘ │
│                       │  │ "revenue-based financing" cryp..│ ⎘ │
│                       │  └─────────────────────────────────┘   │
│                       │                                         │
└───────────────────────┴─────────────────────────────────────────┘
```

### Special Components

**Protocol Cards**
```
┌────────────────────────────────────────┐
│  ┌────────┐                            │
│  │  LOGO  │  Protocol Name             │
│  │  AREA  │  ══════════════            │
│  └────────┘  One-line description      │
│                                        │
│  ┌────────┬────────┬────────┐          │
│  │ $100M+ │  20%+  │ Solana │          │
│  │  TVL   │ Yields │ Chain  │          │
│  └────────┴────────┴────────┘          │
│                                        │
│  [View Deep Search] [Open Protocol →]  │
└────────────────────────────────────────┘
```

**Search String Blocks** (with copy-to-clipboard)
```
┌─────────────────────────────────────────┐
│  PROTOCOL DISCOVERY                   ⎘ │
│  ───────────────────                    │
│  "RWA" "tokenized" -"bitcoin"           │
│  site:twitter.com since:2025-11-01      │
│                                    [Copy]│
└─────────────────────────────────────────┘
```

### Features
- Fuzzy search across all content
- Copy-to-clipboard for search strings
- Collapsible sections for dense content
- "Export as PDF" functionality
- Keyboard shortcuts (/ for search, G+S for sections)

---

## 4. Twitter Research — "Narrative Atlas"

### Design Philosophy
This is the **interactive dashboard** — visual, filterable, explorable. Think: Notion database meets crypto terminal.

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back     NARRATIVE ATLAS     Source: @matyv_7 · Jan 14, 2026 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  2026 NARRATIVE TIER LIST                                       │
│  ═══════════════════════                                        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ S │████████████████████████████████████│ AI · RWA · PM  │   │
│  │ A │██████████████████████████│ Privacy · Robotics · Pay │   │
│  │ B │████████████████████│ PerpDEX · L1/L2 · DeFi        │   │
│  │ C │██████████████│ InfoFi · DePIN · Interop            │   │
│  │ D │████████│ Gaming · Memes · NFTs                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  FILTER BY TIER    FILTER BY CATEGORY                           │
│  ┌───┬───┬───┬───┬───┐  ┌─────────────────────────────────┐   │
│  │ S │ A │ B │ C │ D │  │ All · AI · RWA · Privacy · ...  │   │
│  │ ● │ ○ │ ○ │ ○ │ ○ │  └─────────────────────────────────┘   │
│  └───┴───┴───┴───┴───┘                                         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PROJECT GRID (70+ projects)                                    │
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ S  AI        │ │ S  AI        │ │ S  RWA       │            │
│  │ ┌──────────┐ │ │ ┌──────────┐ │ │ ┌──────────┐ │            │
│  │ │ Bittensor│ │ │ │ Virtuals │ │ │ │   Ondo   │ │            │
│  │ │@opentensor│ │ │@virtuals_io│ │ │@OndoFinance│ │            │
│  │ └──────────┘ │ │ └──────────┘ │ │ └──────────┘ │            │
│  │ Decentralized│ │ Autonomous   │ │ Tokenized    │            │
│  │ ML network   │ │ agent launch │ │ treasuries   │            │
│  │              │ │              │ │              │            │
│  │ [View →]     │ │ [View →]     │ │ [View →]     │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Project Card Component
```jsx
<ProjectCard>
  <TierBadge tier="S" category="AI" />
  <ProjectLogo src={logo} fallback={initials} />
  <ProjectName>Bittensor</ProjectName>
  <Handle>@opentensor</Handle>
  <Description>Decentralized ML network where models train together</Description>
  <Tags>
    <Tag>Decentralized</Tag>
    <Tag>ML</Tag>
  </Tags>
  <Actions>
    <Button variant="ghost">View Details</Button>
    <Button variant="link" href={twitter}>Twitter ↗</Button>
  </Actions>
</ProjectCard>
```

### Features
- Visual tier list with gradient bars
- Multi-select filtering (tier + category)
- Card grid with smooth animations
- Expandable project details in modal/drawer
- "Key Insight" callouts for critical findings
- Search within project list

---

## 5. Strategic Questions — "Strategic Playbook"

### Design Philosophy
This is the **presentation mode experience** — each question is a self-contained exploration that can be navigated like a slideshow or explored deeply. Think: Pitch deck meets technical whitepaper.

### Layout — Overview Mode
```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back     STRATEGIC PLAYBOOK     [Grid View] [Present Mode]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  13 STRATEGIC QUESTIONS                                         │
│  ══════════════════════                                         │
│                                                                 │
│  PART I: STRATEGIC POSITIONING                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1                                                         │  │
│  │ ┌─────────────────────────────────────────────────────┐  │  │
│  │ │  WHERE DOES RITUAL FIT IN THE STACK?                │  │  │
│  │ │  ─────────────────────────────────────              │  │  │
│  │ │  Infrastructure vs. Embedded vs. Category Enabler   │  │  │
│  │ │                                                     │  │  │
│  │ │  Recommendation: Hybrid infrastructure +            │  │  │
│  │ │  category enabler positioning                       │  │  │
│  │ │                                                     │  │  │
│  │ │  ┌─────────────────────────────────────────────┐   │  │  │
│  │ │  │ Contains: Stack diagram, position analysis, │   │  │  │
│  │ │  │ evidence from Twitter research              │   │  │  │
│  │ │  └─────────────────────────────────────────────┘   │  │  │
│  │ │                                        [Explore →] │  │  │
│  │ └─────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│  │ Q2         │ │ Q3         │ │ Q4         │ │ Q5         │  │
│  │ Build vs   │ │ Provenance │ │ Min Viable │ │ Latency    │  │
│  │ Partner    │ │ vs ETH     │ │ Integration│ │ Tolerance  │  │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘  │
│                                                                 │
│  PART II: MARKET INTELLIGENCE                                   │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│  │ Q7         │ │ Q8         │ │ Q9         │ │ Q10        │  │
│  │ Who's      │ │ What       │ │ Real       │ │ Which      │  │
│  │ Buying?    │ │ Broke?     │ │ Competition│ │ Vertical?  │  │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Layout — Deep Dive Mode
```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Overview    Q11 of 13    [◀ Prev] [Next ▶]          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  QUESTION 11                                                    │
│  ══════════                                                     │
│                                                                 │
│  SELF-REPAYING PERPDEX                                          │
│  (Akilesh Concept)                                              │
│  ─────────────────────────────────────────────────              │
│                                                                 │
│  THE PROBLEM                                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Traders have three pain points:                        │   │
│  │                                                         │   │
│  │  ① Don't want to pay funding                           │   │
│  │  ② Don't want to predict funding                       │   │
│  │  ③ Don't want volatile funding decay → liquidation     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  THE ARCHITECTURE                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  [Positive-Carry RWA Collateral] → [Yield Generation]  │   │
│  │              ↓                           ↓              │   │
│  │      [Perp Position]          →    [Funding Offset]    │   │
│  │              ↓                                         │   │
│  │      [Self-Repaying Short/Long]                        │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ECONOMIC MODEL                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  // Example: $100k long ETH position                    │   │
│  │  // Collateral: $100k sDAI (5% APY)                    │   │
│  │                                                         │   │
│  │  Scenario A: Funding < Yield                           │   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━                            │   │
│  │  Yield:    +$13.70/day                                 │   │
│  │  Funding:  -$10.00/day                                 │   │
│  │  Net:      +$3.70/day  ← Cash-flow positive!          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  RITUAL PRIMITIVES REQUIRED                                     │
│  ┌──────────────┬────────────────────────────────────────┐    │
│  │ ONNX         │ Optimal yield routing calculation      │    │
│  │ Scheduled Tx │ Automated yield collection             │    │
│  │ HTTP         │ Off-chain yield rate feeds             │    │
│  └──────────────┴────────────────────────────────────────┘    │
│                                                                 │
│  VERDICT                                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ✓ Technically feasible                                 │   │
│  │  ✓ Novel product category                               │   │
│  │  ✓ Showcases full Ritual primitive stack               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Progress: ████████████░░░░░ 11/13                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Presentation Mode
Full-screen, distraction-free mode with keyboard navigation:
- Arrow keys for navigation
- ESC to exit
- Number keys to jump to specific question
- Dark background, high contrast content

### Features
- Grid overview for browsing all questions
- Deep-dive mode for individual exploration
- Presentation mode for meetings/sharing
- Code blocks with syntax highlighting
- Mermaid/ASCII diagram rendering
- Progress indicator
- "Key Takeaway" summary for each question

---

# Component Library

## Core Components

```
├── Navigation
│   ├── TopNav (back button, title, actions)
│   ├── SideNav (scrollable table of contents)
│   └── Breadcrumbs
│
├── Cards
│   ├── DocumentCard (landing page)
│   ├── ProtocolCard (with metrics)
│   ├── ProjectCard (tier badge, handle)
│   ├── SpeakerCard (avatar, content)
│   └── QuestionCard (playbook overview)
│
├── Content
│   ├── MarkdownRenderer (custom styling)
│   ├── CodeBlock (syntax highlighting, copy)
│   ├── Table (responsive, sortable)
│   ├── Diagram (ASCII art rendering)
│   └── SearchStringBlock (copy to clipboard)
│
├── Interactive
│   ├── TierFilter (S/A/B/C/D toggle)
│   ├── CategoryFilter (multi-select)
│   ├── SearchInput (fuzzy search)
│   ├── Slideshow (prev/next, keyboard)
│   └── Modal/Drawer (project details)
│
├── Feedback
│   ├── Badge (tier, status, category)
│   ├── Tooltip (hover information)
│   ├── Toast (copy confirmation)
│   └── ProgressBar (playbook position)
│
└── Layout
    ├── Container (max-width, padding)
    ├── Grid (responsive columns)
    ├── Split (sidebar + content)
    └── Hero (gradient background)
```

---

# Animation & Interaction Patterns

## Micro-interactions

| Element | Interaction | Animation |
|---------|-------------|-----------|
| Cards | Hover | Subtle lift (translateY -4px) + shadow increase |
| Buttons | Hover | Background color shift + scale(1.02) |
| Links | Hover | Underline slides in from left |
| Code blocks | Copy | Flash highlight + toast notification |
| Sidebar items | Active | Left border accent + background tint |
| Filters | Toggle | Smooth color transition (200ms) |

## Page Transitions

- Fade + slide on route change (150ms)
- Stagger animation for card grids (50ms delay between items)
- Smooth scroll for anchor links

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `/` | Focus search |
| `ESC` | Close modal / exit presentation |
| `←` `→` | Navigate slideshow |
| `J` / `K` | Next / previous section |
| `G` then `H` | Go to home |
| `?` | Show keyboard shortcuts |

---

# Responsive Breakpoints

```
Mobile:     < 640px   (single column, stacked navigation)
Tablet:     640-1024px (2-column grid, collapsible sidebar)
Desktop:    1024-1440px (full layout, sticky sidebar)
Wide:       > 1440px   (max-width container, centered)
```

---

# Implementation Phases

## Phase 1: Foundation (Day 1-2)
- [ ] Set up React + Tailwind project
- [ ] Configure custom theme (colors, typography)
- [ ] Build core components (cards, navigation, code blocks)
- [ ] Implement routing structure

## Phase 2: Landing Page (Day 2-3)
- [ ] Hero section with gradient animation
- [ ] Document cards with hover states
- [ ] Stats bar and insights ticker
- [ ] Responsive layout

## Phase 3: Content Pages (Day 3-5)
- [ ] Transcript page with speaker cards
- [ ] Intelligence Brief with sidebar navigation
- [ ] Twitter Research with filtering
- [ ] Strategic Playbook with slideshow

## Phase 4: Polish (Day 5-6)
- [ ] Animations and transitions
- [ ] Keyboard shortcuts
- [ ] Mobile responsiveness
- [ ] Performance optimization

## Phase 5: Deployment (Day 6)
- [ ] Build optimization
- [ ] Deploy to Vercel/Netlify
- [ ] Test across browsers/devices

---

# File Structure

```
ritual-rwa-intelligence/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── cards/
│   │   ├── content/
│   │   ├── interactive/
│   │   ├── layout/
│   │   └── navigation/
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Transcript.jsx
│   │   ├── IntelligenceBrief.jsx
│   │   ├── NarrativeAtlas.jsx
│   │   └── StrategicPlaybook.jsx
│   ├── data/
│   │   ├── transcript.json
│   │   ├── intelligence-brief.json
│   │   ├── projects.json
│   │   └── questions.json
│   ├── styles/
│   │   └── globals.css
│   ├── utils/
│   │   ├── markdown.js
│   │   └── search.js
│   ├── App.jsx
│   └── main.jsx
├── tailwind.config.js
├── package.json
└── README.md
```

---

# Open Questions for Your Review

1. **Branding**: Should this use Ritual's actual brand assets (logo, exact colors), or should it be styled as an internal intelligence tool with its own identity?

2. **Authentication**: Is this purely internal, or might it be shared externally? (Affects whether we need any access control)

3. **Export Features**: Would PDF export of individual sections be valuable?

4. **Data Updates**: Should this be designed for easy content updates, or is this a point-in-time snapshot?

5. **Presentation Mode**: Is the slideshow/presentation functionality for the Strategic Playbook valuable for team meetings, or overkill?

---

*Design plan prepared for review. Awaiting feedback before implementation.*
