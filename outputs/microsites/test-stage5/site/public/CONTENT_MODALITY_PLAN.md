# Content Modality Plan
## Ritual Intelligence Microsite

---

# Overview

Each section of the microsite serves a distinct informational purpose and requires a tailored presentation modality. This document outlines how each content type maps to user intent, cognitive load considerations, and the Making Software aesthetic.

---

# Section-by-Section Modality Analysis

## 1. LANDING PAGE — "The Briefing Room"

**User Intent:** Quick orientation, navigation decision-making
**Cognitive State:** Scanning, evaluating options
**Content Type:** Orienting/navigational

**Modality:** **Command Dashboard**
- Hero with clear positioning statement (not marketing fluff)
- Four entry points as figure-style cards with metadata (sections, word count, key insight)
- Live data visualization: a simple isometric "stack diagram" showing where each document fits conceptually
- Key insight ticker drawn directly from source documents

**Aesthetic Application:**
- Making Software hero style: monospace title, serif tagline, dotted separator
- Cards as "figure blocks" with FIG.001 style numbering
- No dark mode on landing — honor the blueprint aesthetic

**Content Treatment:** Net-new editorial framing. The landing page doesn't exist in our documents; it requires a synthesized orientation that positions the reader.

---

## 2. TRANSCRIPT — "The Conversation"

**User Intent:** Understand what was said, who said it, follow the discussion
**Cognitive State:** Reading, absorbing conversational flow
**Content Type:** Primary source material

**Modality:** **Annotated Long-form Article**
- Direct one-to-one exposure of transcript content
- Speaker cards with initials, role context
- Sticky table of contents for navigation
- Inline annotations for key moments (editorial additions)
- "Jump to Q&A" prominent since that's where novel ideas emerge

**Aesthetic Application:**
- Two-column layout: TOC left, content right
- Speaker cards styled as figure annotations
- Monospace for speaker names, serif for dialogue
- Section dividers as dotted rules

**Content Treatment:** 90% direct exposure, 10% editorial annotation. The transcript is the primary source; augmentations should feel like marginalia, not rewrites.

**Editorial Additions:**
- Brief contextual notes before each Part (1-2 sentences max)
- Inline [EDITOR'S NOTE] for technical terms or references
- Pull quotes for standout insights

---

## 3. INTELLIGENCE BRIEF — "The Dossier"

**User Intent:** Reference lookup, deep research, actionable intelligence
**Cognitive State:** Searching, cross-referencing, extracting
**Content Type:** Reference documentation

**Modality:** **Technical Documentation Hub**
- Sidebar navigation with collapsible sections
- Protocol cards with structured metadata (TVL, yields, chain, mechanism)
- Search string blocks with copy functionality
- Tables for structured comparisons
- Integration matrix showing Ritual primitives → use cases

**Aesthetic Application:**
- Full Making Software documentation feel
- Protocol cards as isometric "component diagrams"
- Search strings as code blocks with clipboard icons
- Tables styled as technical specifications

**Content Treatment:** Direct exposure with enhanced navigation. The Intelligence Brief is already well-structured; the task is surfacing that structure through UI, not rewriting content.

**Net-New Additions:**
- Executive summary (first-screen synthesis)
- Quick reference panel: "5 Things to Remember"
- Visual primitive mapping diagram

---

## 4. NARRATIVE ATLAS — "The Landscape"

**User Intent:** Survey the market, filter by interest, discover projects
**Cognitive State:** Exploring, comparing, pattern-matching
**Content Type:** Structured data catalog

**Modality:** **Interactive Dashboard**
- Tier visualization as horizontal bar chart (S → D)
- Filterable project grid
- Project cards with tier badge, handle, description
- Category breakdown with project counts
- "Ritual Opportunity" overlay showing where primitives apply

**Aesthetic Application:**
- Tier bars as technical gauges/meters
- Project cards as labeled components in exploded view
- Filters as technical controls (not flashy toggles)
- Monospace for handles and tiers, serif for descriptions

**Content Treatment:** Structured data extraction from Twitter research + net-new synthesis. The Twitter notes are comprehensive but flat; the Atlas transforms them into navigable intelligence.

**Net-New Additions:**
- "Why S-Tier?" editorial analysis for each category
- Ritual opportunity annotations per project
- Cross-reference links to relevant Strategic Questions

---

## 5. STRATEGIC PLAYBOOK — "The Questions"

**User Intent:** Deep thinking, strategic analysis, technical exploration
**Cognitive State:** Deliberating, synthesizing, deciding
**Content Type:** Analytical frameworks + technical deep-dives

**Modality:** **Slideshow + Deep-Dive Hybrid**
- Overview mode: grid of all 13 questions as cards
- Focus mode: one question at a time, full-screen
- Progressive disclosure: Question → Context → Analysis → Recommendation → Technical Detail
- Keyboard navigation for presentation use

**Aesthetic Application:**
- Each question as a "figure" with number and title
- Architecture diagrams rendered in blueprint style
- Code examples in monospace blocks
- Recommendation boxes as highlighted callouts

**Content Treatment:** This is where we go 2σ above baseline. The Strategic Questions document contains frameworks and analyses; the Playbook must present them with intellectual precision and editorial voice.

**Net-New Editorial:**
- Opening framing for each question (why it matters)
- Synthesis across questions (how Q3 relates to Q7)
- "If We Had to Decide Today" verdict for each
- Visual architecture diagrams (not just ASCII — proper SVG)

---

# Editorial Voice Guidelines

For net-new content, the writing should exhibit:

1. **Precision over cleverness** — Every sentence should advance understanding
2. **Structural clarity** — Thesis → evidence → implication
3. **Technical confidence** — We know these systems; write like it
4. **Intellectual honesty** — Acknowledge uncertainty where it exists
5. **Strategic synthesis** — Connect dots the source material leaves implicit

**Avoid:**
- Marketing language ("revolutionary," "game-changing")
- Hedging without reason ("it could be argued that perhaps...")
- Restating the obvious
- Bullet points where prose would be clearer

---

# Implementation Priority

1. **Foundation** — CSS system, fonts, colors from Making Software
2. **Landing Page** — Sets tone, enables navigation
3. **Transcript** — Largest content volume, establishes reading experience
4. **Intelligence Brief** — Reference hub, demonstrates documentation capability
5. **Narrative Atlas** — Interactive showcase, demonstrates data handling
6. **Strategic Playbook** — Capstone, demonstrates analytical depth

---

*This plan governs content treatment across all microsite sections.*
