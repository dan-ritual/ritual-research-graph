import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { ChevronDown, ChevronUp, Copy, Download, ExternalLink, Bot, Plus, Minus, FileText, X } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// FONT SIZE CONTEXT (Global text scaling)
// ─────────────────────────────────────────────────────────────────────────────

const FontSizeContext = createContext({ scale: 1, setScale: () => {} });
const useFontSize = () => useContext(FontSizeContext);

// ═══════════════════════════════════════════════════════════════════════════
// RITUAL INTELLIGENCE - Making Software Aesthetic
// Institutional-Grade Research Dossier
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT DATA (for TradingView + Links)
// ─────────────────────────────────────────────────────────────────────────────

const PROJECTS = {
  'Ondo Finance': { website: 'https://ondo.finance', twitter: 'OndoFinance', tvSymbol: 'COINBASE:ONDOUSD' },
  'Maple Finance': { website: 'https://maple.finance', twitter: 'maplefinance', tvSymbol: null },
  'Goldfinch': { website: 'https://goldfinch.finance', twitter: 'goldaborinch_fi', tvSymbol: 'COINBASE:GFIUSD' },
  'Centrifuge': { website: 'https://centrifuge.io', twitter: 'centrifuge', tvSymbol: 'KRAKEN:CFGUSD' },
  'Zivoe': { website: 'https://zivoe.com', twitter: 'ZivoeProtocol', tvSymbol: null },
  'Credix': { website: 'https://credix.finance', twitter: 'CredixFinance', tvSymbol: null },
  'Provenance': { website: 'https://provenance.io', twitter: 'proaborenance_io', tvSymbol: null },
  'Plume': { website: 'https://plume.network', twitter: 'PlumeFDN', tvSymbol: null },
  'Clearpool': { website: 'https://clearpool.finance', twitter: 'ClearpoolFin', tvSymbol: null },
  'Aave': { website: 'https://aave.com', twitter: 'aave', tvSymbol: 'COINBASE:AAVEUSD' },
  'Compound': { website: 'https://compound.finance', twitter: 'compoundfinance', tvSymbol: 'COINBASE:COMPUSD' },
  'Morpho': { website: 'https://morpho.org', twitter: 'MorphoLabs', tvSymbol: null },
  'Euler': { website: 'https://euler.finance', twitter: 'eulerfinance', tvSymbol: null },
  'BlackRock BUIDL': { website: 'https://securitize.io/blackrock', twitter: 'BlackRock', tvSymbol: null },
  'Hyperliquid': { website: 'https://hyperliquid.xyz', twitter: 'HyperliquidX', tvSymbol: 'COINBASE:HYPEUSD' },
  'EtherFi': { website: 'https://ether.fi', twitter: 'ether_fi', tvSymbol: 'COINBASE:ETHFIUSD' },
  'Parcl': { website: 'https://parcl.co', twitter: 'Parcl', tvSymbol: null },
  'Alchemix': { website: 'https://alchemix.fi', twitter: 'AlchemixFi', tvSymbol: 'COINBASE:ALCXUSD' },
  // Additional protocols mentioned in content
  'Maple': { website: 'https://maple.finance', twitter: 'maplefinance', tvSymbol: null },
  'Ondo': { website: 'https://ondo.finance', twitter: 'OndoFinance', tvSymbol: 'COINBASE:ONDOUSD' },
  'Chainlink': { website: 'https://chain.link', twitter: 'chainlink', tvSymbol: 'COINBASE:LINKUSD' },
  'Morpho Blue': { website: 'https://morpho.org', twitter: 'MorphoLabs', tvSymbol: null },
};

// ─────────────────────────────────────────────────────────────────────────────
// EXECUTIVE SUMMARY DATA (+2σ Key Findings, +3σ Recommendations)
// ─────────────────────────────────────────────────────────────────────────────

const EXECUTIVE_SUMMARY = {
  title: 'RITUAL INTELLIGENCE',
  subtitle: 'RWA × DeFi × AI · January 2026',
  thesis: 'RWA crossed $35B with 7x growth in 2025, but credit decisions remain manual and off-chain. Ritual can be the verifiable intelligence layer these protocols need but can\'t build themselves.',

  keyFindings: [
    {
      title: 'Market Position',
      content: '**RWA TVL crossed $35B** in January 2026, representing **7x growth** from $5B at start of 2025. More significant: asset composition shifted from 90% tokenized treasuries to diversified mix including private credit (28%), real estate (12%), and insurance (8%). We\'re past early adopter phase into **early majority**.'
    },
    {
      title: 'Structural Shift',
      content: 'The 2022-23 defaults (**Maple: $54M** across Orthogonal Trading pools) forced industry-wide pivot from trust-based under-collateralized lending to **asset-backed structures**. This isn\'t regression—it\'s the same maturation arc DeFi traversed from Cream Finance exploits to Morpho Blue\'s isolated markets. Under-collateralization will return, but with **verifiable credit infrastructure**.'
    },
    {
      title: 'Catalyst Analysis',
      content: '**BlackRock BUIDL** wasn\'t just institutional validation—it was **infrastructure endorsement**. Ethereum settlement, Securitize tokenization, Coinbase custody created a template now being replicated by Franklin Templeton, WisdomTree, and Hamilton Lane. The "follow the leader" effect has **18-24 month runway**.'
    },
    {
      title: 'Intelligence Gap',
      content: 'In our protocol survey, **only Bid.io attempts on-chain AI** (risk pricing oracle). Maple, Credix, Zivoe, Goldfinch—all running credit decisions off-chain via manual review or opaque ML. This creates **concentration risk**: one provider\'s model failure cascades across protocols. The gap isn\'t "AI would be nice"—it\'s **"verifiable inference is infrastructurally necessary."**'
    },
    {
      title: 'DeFi×RWA Convergence',
      content: 'Modern DeFi primitives are enabling RWA innovation that wasn\'t possible in 2021. **Zivoe\'s spigot mechanism** (streaming revenue repayment) mirrors Alchemix\'s self-repaying loans. **Credix\'s future cash flow collateralization** resembles DeFi\'s overcollateralization but for off-chain income. The pattern: **DeFi battle-tested the mechanics, RWA applies them to real assets**.'
    },
    {
      title: 'Novel Primitive',
      content: 'The internal discussion surfaced a genuinely novel concept: **self-repaying perpetuals** using positive-carry RWA collateral. If your collateral generates yield (tokenized treasuries at 4-5%), that yield can **offset funding rates**. This transforms the PerpDEX value proposition—no longer just leverage, but **capital-efficient hedging with self-financing positions**.'
    }
  ],

  recommendations: [
    {
      title: 'Positioning',
      content: 'Position as **hybrid infrastructure + category enabler**. Don\'t compete with RWA protocols—become the **verification layer** they need but can\'t build. The mental model: **Chainlink for price feeds, Ritual for intelligence feeds**.'
    },
    {
      title: 'Reference Implementation',
      content: 'Build **ONE reference app**: verifiable credit scoring for private credit protocols. Target: **Zivoe or similar ($5-50M TVL)**. Scope: ONNX model for merchant cash advance risk, deployed with full inference verification. Success metric: **"Built with Ritual" badge** becomes credibility signal.'
    },
    {
      title: 'Target Segment',
      content: '**Mid-tier RWA protocols ($5M-$100M TVL)** bottlenecked by manual loan origination. Qualification: (1) active lending with **utilization >70%**, (2) team publicly discussing scaling constraints, (3) no existing AI infrastructure partnerships. Avoid: sub-$5M (too early), >$100M (too bureaucratic).'
    },
    {
      title: 'Vertical Depth',
      content: '**Private credit first, insurance second**. Private credit has highest pain intensity (loan origination is manual, slow, expensive) and best technical fit (credit models are well-defined ML problems). Insurance event verification is compelling but requires oracle infrastructure that extends scope. **Sequence matters**.'
    },
    {
      title: 'BD vs. Integration',
      content: 'Some opportunities are **business development** (partnership announcements, co-marketing), others are **technical integration** (actual primitive usage). Be honest about which is which. Ondo partnership = BD win. Zivoe credit scoring = technical integration. **Both valuable, different value capture**.'
    },
    {
      title: 'DeFi Bridge',
      content: 'Leverage existing DeFi relationships. **Aave, Morpho, and Euler** already trust Ritual\'s technical approach. Their RWA expansions are integration surfaces. Path: **DeFi credibility → RWA introduction → primitive adoption**.'
    },
    {
      title: 'Narrative Positioning',
      content: 'The 2026 market **rewards proof, not belief**. Position Ritual as "the proof infrastructure"—literally. When an RWA protocol claims their AI is accurate, Ritual verification makes that claim auditable. Message: **"If it\'s not verifiable, it\'s not trustworthy."**'
    },
    {
      title: 'Anti-patterns',
      content: '**Avoid**: (1) claiming Ritual "revolutionizes" anything—institutions distrust hyperbole, (2) listing all five primitives for every use case—pick the one that matters, (3) pursuing protocols with no clear path to primitive usage, (4) **competing on price—compete on verification guarantees**.'
    }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// DEEP DIVES DATA
// ─────────────────────────────────────────────────────────────────────────────

const DEEP_DIVES = [
  {
    id: 'defi-rwa',
    title: 'FIG.001 · The DeFi→RWA Through-Line',
    subtitle: 'Historical Substrate · 2021-2026',
    isContent: true,
    content: `## DeFi Summer 2021: The Foundation

The 2021 DeFi explosion established primitives that directly inform today's RWA architecture. Compound and Aave pioneered algorithmic interest rate markets. Cream Finance pushed into long-tail assets—then collapsed under exploit pressure, demonstrating that risk management couldn't be an afterthought.

**The lesson internalized:** compartmentalize risk. Morpho Blue's isolated markets and Euler V2's modular vaults emerged from these failures. This pattern—catastrophe → isolation → maturation—is now repeating in RWA.

## The RWA Parallel

Maple Finance's under-collateralized institutional lending seemed sophisticated in 2022. Then FTX collapsed, Orthogonal Trading defaulted, and $54M in losses proved that "institutional reputation" wasn't collateral. Maple pivoted to asset-backed lending with 0% default rate post-restructuring.

**The pattern:** RWA is following DeFi's maturation arc, compressed into faster cycles. What took DeFi 2019-2023 (four years), RWA is completing 2022-2026 (four years). The difference: RWA has DeFi's playbook.

## 2026: The Convergence

The current RWA stack incorporates DeFi learnings:
- **Yield mechanics:** Zivoe's streaming revenue repayment mirrors Alchemix's self-repaying structure
- **Risk isolation:** Credix's tranched pools apply DeFi's senior/junior mechanics to off-chain credit
- **Collateral innovation:** Future cash flow collateralization extends overcollateralization beyond spot assets

What's missing: the intelligence layer that made DeFi capital-efficient. Aave has sophisticated risk parameters. Maple has manual loan review. The gap is infrastructure, not imagination.

## The Opportunity Space

First-order effects are direct automation: ONNX models replacing manual credit review, HTTP calls verifying off-chain events, scheduled transactions managing loan lifecycle.

Second-order effects are emergent: verified credit scores portable across protocols, risk pricing that updates in real-time, insurance payouts triggered by verifiable events without claims processing.

Third-order effects are structural: RWA protocols competing on intelligence quality (because it's verifiable), new product categories enabled by automation (self-repaying perpetuals), market structure changes as manual processes become bottlenecks for non-automated competitors.`
  },
  {
    id: 'transcript',
    title: 'FIG.002 · The Conversation',
    subtitle: 'Internal Strategy Session · January 15, 2026',
    file: 'RWA_DeFi_2026_Transcript_Clean.md',
    summary: 'Full transcript of the RWA + DeFi strategic overview. Key participants: Wally (market context), Jun Yi (protocol deep-dives), Akilesh (novel concepts including self-repaying perpetuals). 8 parts covering market evolution, protocol landscape, and Q&A discussion.'
  },
  {
    id: 'intelligence',
    title: 'FIG.003 · Intelligence Brief',
    subtitle: '11 Sections · 50+ Protocols',
    file: 'RWA_DeFi_2026_Intelligence_Brief.md',
    summary: 'Comprehensive dossier covering protocol deep-dives (Maple, Zivoe, Credix, Provenance, Ondo), competitive landscape analysis, and primary source research links. Deep Search strings upgraded to institutional-grade: Dune dashboards, governance forums, on-chain analytics.'
  },
  {
    id: 'atlas',
    title: 'FIG.004 · Project Atlas',
    subtitle: '70+ Protocols · Tiered Analysis',
    isContent: true,
    content: `## 2026 Narrative Tier List

The market rewards **proof, not belief**. This cycle is driven by institutions deploying capital selectively—not retail speculation. Projects need real users, real utility, real revenue. Token value accrual matters: governance-only tokens are questioned; buybacks and burning based on revenue = real value accrual.

| Tier | Narratives | Investment Thesis |
|------|------------|-------------------|
| **S** | AI, RWAs, Prediction Markets | Structural shift, institutional demand, verifiability premium |
| **A** | Privacy, Robotics, Payments/Neobanks | Infrastructure plays, emerging moats, regulatory tailwinds |
| **B** | Perp DEXes, L1/L2, DeFi | Maturing markets, selectivity increasing, usage > design |
| **C** | InfoFi, DePIN, Interoperability | Real demand, weak token value capture |
| **D** | Gaming, Memes, NFTs | Speculative, retail-driven, risk-reward deteriorated |

---

## S-TIER: RWA Protocols

### Ondo Finance
**$600M+ TVL** · Tokenized treasuries (OUSG) and yield-bearing stablecoin (USDY). Primary distribution partner for BlackRock BUIDL. The rebasing mechanism for USDY delivers yield without user action—a UX innovation that increases stickiness. Fastest institutional-to-retail expansion trajectory.

**Strategic significance:** Ondo represents the "tokenized treasury" baseline that enabled RWA acceleration when Fed rates hit 4-5%. Their positioning at the BlackRock distribution layer makes them the default on-ramp for institutional RWA exposure.

### Maple Finance
**~$100M TVL · 0% post-pivot default rate** · "Maple Direct" offers secured loans against verifiable collateral. The pivot from under-collateralized to over-collateralized after $54M in Orthogonal Trading defaults mirrors industry-wide maturation.

**Strategic significance:** Maple's trajectory illustrates the "Cream Finance → Morpho Blue" pattern applied to RWA. Their survival and pivot demonstrates that RWA protocols can learn from DeFi's risk management evolution.

### Zivoe
**~$6M TVL · 95% utilization · 3.6% yields** (highest observed in private credit). Merchant cash advance protocol where the "spigot mechanism" streams revenue toward repayment—you only pay when you earn. Revenue-to-TVL ratio among highest observed.

**Strategic significance:** Zivoe's model directly inspired the **self-repaying perpetuals concept**. The spigot mechanism = streaming yield that could offset funding rates. This is the clearest Ritual integration target for demonstrating verifiable credit scoring.

### Credix
**$100M+ TVL · Historical 20%+ yields** · Key innovation: businesses collateralize future cash flows (not current assets). Client Rain powers EtherFi cards, collateralizes predictable fee revenue from transaction processing.

**Strategic significance:** Credix extends the self-repaying pattern to income streams. Their future cash flow collateralization model could benefit from ONNX-based revenue prediction and HTTP verification of off-chain payment flows.

### Centrifuge
Leading RWA tokenization platform bringing full power of on-chain finance to asset managers. Focus on structured finance products with tranched risk exposure.

**Strategic significance:** Centrifuge's tranching mechanisms parallel DeFi's senior/junior pool structures. Ritual primitives could enable dynamic tranche rebalancing based on verified risk signals.

### Additional RWA Protocols
- **Clearpool** - On-chain credit marketplace for fintechs and trading firms
- **Rayls Labs** - Bridges TradFi/DeFi with compliant public EVM + private institutional chains
- **Chintai** - Regulated digital asset platform with full compliance infrastructure
- **KAIO** - First protocol purpose-built for RWAs on sovereign AppChain

---

## S-TIER: AI Infrastructure

### The Verifiability Bottleneck

**"The main bottleneck for AI agents is no longer intelligence—it's verifiability."**

AI models crossed the threshold where they can be trusted with meaningful work. Researchers use them for deep reasoning. The shift to "vibe coding" means humans guide systems rather than manually execute. But agents need cryptographically verifiable identities defining who they act for, what they're allowed to do, and who bears liability.

### Know Your Agent (KYA) Emerging Primitive
- Non-human identities already outnumber humans in financial systems
- Most cannot transact, hold value, or be accountable
- ERC-8004 (Trustless Agents) enables agents across org boundaries
- x402 payment standards enable agent-to-agent transfers including stablecoins

### Key AI Protocols
- **Bittensor** (@opentensor) - Decentralized ML network where models compete to deliver intelligence
- **Virtuals** (@virtuals_io) - Launchpad for autonomous AI agents with own wallets
- **Sahara AI** - Tens of millions revenue from Amazon, Alibaba; Sahara 2.0 launching
- **OpenGradient** - Core infrastructure for verifiable AI systems

**Ritual positioning:** Ritual provides the verification layer these protocols need. ONNX inference on-chain, TEE execution for confidential computation, and scheduled transactions for autonomous agent operations.

---

## A-TIER: Privacy Infrastructure

**"Privacy will be the most important moat in crypto. Why? Because secrets are hard to migrate."** — Ali Yahya

The narrative is shifting: privacy is being repriced as **infrastructure, not ideology**. Fully transparent money = liability in a world of AI, chain analysis, and financial controls. Real-world use cases DEMAND confidentiality by default: payments, RWAs, wealth management, agent-driven finance.

### Key Privacy Protocols
- **Monero** - Default-private L1 with ring signatures
- **Zcash** - First ZK encryption for payments
- **Canton Network** - Privacy-enabled blockchain for institutional finance
- **Zama** - FHE (compute on encrypted data without revealing)
- **Arcium** - AI on encrypted data while preserving privacy

**Ritual positioning:** Secret Encryption + TEE = privacy-preserving computation on-chain. Essential for institutional RWA adoption requiring regulatory compliance with data confidentiality.

---

## A-TIER: Payments & Neobanks

Stablecoins crossed proof-of-concept with tens of trillions in annualized volume. They're not just money—they're a **ledger upgrade**: real-time, global, programmable settlement without rewriting legacy infrastructure.

### Key Protocols
- **EtherFi** - Liquid restaking → on-chain neobank with cash card
- **Plasma** - Stablecoin-only neobank for emerging markets
- **Superform** - Cross-chain yield aggregation as on-chain savings account
- **Tria** - Chain-abstracted crypto app with unified balance

**Ritual positioning:** Scheduled transactions enable automated treasury management. ONNX models could power credit underwriting for neobank lending products.

---

## B-TIER: PerpDEXes

Product quality now comparable to (sometimes better than) CEXes. Instant settlement, self-custody, custom-built blockchains. Next growth leg: WHAT gets traded—commodities, equities, indices. PerpDEXes become the easiest way to express leveraged macro views.

### Key Protocols
- **Hyperliquid** - PerpDEX + L1 ecosystem; already offers stocks/metals
- **Aster DEX** - Backed by CZ; planning own L1; direct Hyperliquid competitor
- **Lighter** - Verifiable order matching with 0% fees

**Self-Repaying Perpetuals Concept:** If RWA collateral (tokenized treasuries) generates positive carry at 4-5%, that yield can offset funding rates. This transforms the PerpDEX value proposition—capital-efficient hedging with self-financing positions. PerpDEX + Alchemix mechanics = self-repaying funding.

---

## B-TIER: DeFi Infrastructure

Leading protocols with deep liquidity and proven risk management offer attractive yields. Selectivity increased—returns concentrated in fewer, higher-quality venues.

### Core Protocols
- **Chainlink** - Industry-standard oracle; bringing capital markets on-chain
- **Aave** - Leading lending protocol by TVL, adoption, maturity
- **Ethena** - USDe synthetic dollar with crypto collateral + derivatives hedging
- **Pendle** - Yield tokenization; trade yield separately from principal
- **Morpho** - Isolated markets enabling protocol-level risk compartmentalization

**Ritual positioning:** DeFi credibility → RWA introduction → primitive adoption. Aave, Morpho, and Euler already trust Ritual's technical approach. Their RWA expansions are integration surfaces.

---

## Infrastructure & Compliance Layer

### Provenance (Figure)
**$20B claimed TVL** (partially unverifiable on-chain). Primary assets: HELOCs ($15B claimed), insurance ($600M), tokenized equities. Insurance vertical grew **6x in 2025**.

**Ritual opportunity:** Insurance event verification (hurricanes, natural disasters) is a clear use case for HTTP calls verifying off-chain events and triggering automated payouts.

### Plume
RWA-specific L2 with embedded KYC/AML, programmable compliance, and built-in DeFi primitives. Addresses the "RWA stack fragmentation" problem.

**Ritual opportunity:** Represents the "compliance-first" approach. Ritual primitives could enable compliant AI operations within Plume's regulatory framework.

---

## Ritual Primitive Mapping to 2026 Narratives

| Narrative | Ritual Primitive | Application |
|-----------|------------------|-------------|
| AI Verifiability | ONNX Inference | On-chain credit scoring, fraud detection |
| AI Verifiability | TEE Executors | Verifiable off-chain AI computation |
| Know Your Agent | Secret Encryption | Agent identity credentials |
| Agent Payments | Scheduled Tx | Autonomous recurring agent operations |
| RWA Infrastructure | HTTP Calls | Off-chain event verification (insurance) |
| RWA Infrastructure | ONNX | Risk pricing, collateral assessment |
| Privacy | Secret Encryption + TEE | Confidential RWA operations |
| Prediction Markets | ONNX + HTTP | Real-time data feeds, outcome verification |
| Neobanks/Payments | Scheduled Tx | Automated treasury management |`
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE ARTIFACTS (Generated by Claude Cowork)
// ─────────────────────────────────────────────────────────────────────────────

const SOURCE_ARTIFACTS = [
  {
    id: 'intelligence-brief',
    title: 'Intelligence Brief',
    subtitle: 'Comprehensive RWA × DeFi Dossier',
    file: 'RWA_DeFi_2026_Intelligence_Brief.md',
    description: '11 sections covering protocol deep-dives, competitive landscape, and institutional-grade research links.'
  },
  {
    id: 'transcript-clean',
    title: 'Cleaned Transcript',
    subtitle: 'Strategy Session · Jan 15, 2026',
    file: 'RWA_DeFi_2026_Transcript_Clean.md',
    description: 'Full meeting transcript with participants: Wally, Jun Yi, Akilesh. 8 parts covering market evolution and protocol landscape.'
  },
  {
    id: 'strategic-questions',
    title: 'Strategic Questions',
    subtitle: 'Deep Explorations & Analysis',
    file: 'RWA_DeFi_Strategic_Questions_Explorations.md',
    description: 'Extended analysis exploring strategic questions raised during the session, with detailed protocol breakdowns.'
  },
  {
    id: 'twitter-research',
    title: 'Narrative Research',
    subtitle: '2026 Market Narratives',
    file: 'Twitter_Research_Notes_Matyv_2026_Narratives.md',
    description: 'External research notes on emerging 2026 narratives including AI, RWAs, prediction markets, and payments.'
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// STYLES (Making Software Aesthetic)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// FONT CONSTANTS (God-tier rendering with JetBrains Mono + Crimson Text)
// ─────────────────────────────────────────────────────────────────────────────

const FONTS = {
  mono: '"JetBrains Mono", "SF Mono", "Consolas", monospace',
  serif: '"Crimson Text", Georgia, "Times New Roman", serif',
  display: '"Space Grotesk", "Inter", system-ui, sans-serif',
};

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#FBFBFB',
    color: '#171717',
    fontFamily: FONTS.serif,
    fontSize: '17px',
    lineHeight: '1.7',
    letterSpacing: '0.01em',
    backgroundImage: 'linear-gradient(rgba(0,0,0,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.018) 1px, transparent 1px)',
    backgroundSize: '20px 20px',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    textRendering: 'optimizeLegibility'
  },
  container: {
    maxWidth: '880px',
    margin: '0 auto',
    padding: '80px 48px 120px'
  },
  mono: {
    fontFamily: FONTS.mono
  },
  // Header
  header: {
    marginBottom: '64px',
    textAlign: 'center'
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: '56px',
    fontWeight: '700',
    letterSpacing: '-0.03em',
    textTransform: 'uppercase',
    margin: '0 0 16px 0',
    lineHeight: '1.1',
    color: '#3B5FE6'
  },
  subtitle: {
    fontFamily: FONTS.mono,
    fontSize: '12px',
    fontWeight: '400',
    letterSpacing: '0.2em',
    color: 'rgba(0,0,0,0.45)',
    textTransform: 'uppercase',
    margin: 0
  },
  // Sections
  section: {
    marginBottom: '64px'
  },
  sectionTitle: {
    fontFamily: FONTS.mono,
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#3B5FE6',
    marginBottom: '28px',
    paddingBottom: '16px',
    borderBottom: '1px dotted rgba(59,95,230,0.3)'
  },
  // Finding/Recommendation Cards
  card: {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid rgba(0,0,0,0.05)'
  },
  cardTitle: {
    fontFamily: FONTS.mono,
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '0.01em',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  cardBullet: {
    color: '#3B5FE6',
    fontSize: '13px',
    fontWeight: '400'
  },
  cardContent: {
    fontFamily: FONTS.serif,
    fontSize: '17px',
    lineHeight: '1.72',
    color: 'rgba(0,0,0,0.82)',
    paddingLeft: '25px',
    letterSpacing: '0.008em'
  },
  // Deep Dive Card
  deepDiveCard: {
    border: '1px solid rgba(0,0,0,0.08)',
    marginBottom: '16px',
    backgroundColor: '#fff'
  },
  deepDiveHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 28px',
    cursor: 'pointer',
    userSelect: 'none'
  },
  deepDiveTitle: {
    fontFamily: FONTS.mono,
    fontSize: '16px',
    margin: '0 0 8px 0',
    fontWeight: '600',
    letterSpacing: '-0.01em',
    color: '#3B5FE6'
  },
  deepDiveSubtitle: {
    fontFamily: FONTS.mono,
    fontSize: '10px',
    fontWeight: '500',
    letterSpacing: '0.12em',
    color: 'rgba(0,0,0,0.4)',
    margin: 0,
    textTransform: 'uppercase'
  },
  deepDiveContent: {
    padding: '0 28px 28px',
    borderTop: '1px dotted rgba(0,0,0,0.08)'
  },
  // Content area
  contentArea: {
    padding: '16px 0 0 0',
    fontSize: '17px',
    lineHeight: '1.72',
    fontFamily: FONTS.serif
  },
  // Thesis
  thesis: {
    fontFamily: FONTS.serif,
    fontSize: '22px',
    lineHeight: '1.6',
    textAlign: 'center',
    padding: '48px 40px',
    margin: '0 0 64px 0',
    borderTop: '1px dotted rgba(0,0,0,0.15)',
    borderBottom: '1px dotted rgba(0,0,0,0.15)',
    fontStyle: 'italic',
    color: 'rgba(0,0,0,0.75)',
    letterSpacing: '0.01em'
  },
  // Transcript controls
  transcriptControls: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px'
  },
  controlButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 16px',
    fontSize: '10px',
    fontFamily: FONTS.mono,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    border: '1px solid rgba(0,0,0,0.15)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: 'rgba(0,0,0,0.6)',
    transition: 'all 0.15s ease'
  },
  // Project link
  projectLink: {
    color: '#3B5FE6',
    textDecoration: 'none',
    borderBottom: '1px dotted rgba(59, 95, 230, 0.5)',
    cursor: 'pointer',
    position: 'relative',
    display: 'inline-block',
    transition: 'border-color 0.15s ease'
  },
  twitterSup: {
    fontFamily: FONTS.mono,
    fontSize: '9px',
    fontWeight: '400',
    color: 'rgba(0,0,0,0.35)',
    marginLeft: '2px',
    textDecoration: 'none'
  },
  // Chart popup
  chartPopup: {
    position: 'absolute',
    top: '100%',
    left: 0,
    zIndex: 1000,
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.08)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
    marginTop: '8px'
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TOKEN HOVER COMPONENT (TradingView Embed)
// ─────────────────────────────────────────────────────────────────────────────

const TokenHover = ({ symbol, children }) => {
  const [show, setShow] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const containerRef = useRef(null);
  const widgetRef = useRef(null);
  const timeoutRef = useRef(null);

  // No token = no hover effect
  if (!symbol) return children;

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setShow(true), 200);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setShow(false);
    setWidgetReady(false);
  };

  useEffect(() => {
    if (show && containerRef.current && window.TradingView && !widgetRef.current) {
      try {
        widgetRef.current = new window.TradingView.widget({
          symbol: symbol,
          width: 320,
          height: 220,
          interval: 'D',
          theme: 'light',
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          hide_top_toolbar: true,
          hide_legend: true,
          save_image: false,
          container_id: containerRef.current.id,
          autosize: false
        });
        setWidgetReady(true);
      } catch (e) {
        console.log('TradingView widget error:', e);
      }
    }

    return () => {
      if (!show) {
        widgetRef.current = null;
      }
    };
  }, [show, symbol]);

  const uniqueId = `chart-${symbol.replace(/[^a-zA-Z0-9]/g, '-')}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', display: 'inline' }}
    >
      {children}
      {show && (
        <div style={styles.chartPopup}>
          <div
            ref={containerRef}
            id={uniqueId}
            style={{ width: 320, height: 220 }}
          />
        </div>
      )}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT LINK COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const ProjectLink = ({ name }) => {
  const project = PROJECTS[name];
  if (!project) return <span>{name}</span>;

  const content = (
    <a
      href={project.website}
      target="_blank"
      rel="noopener noreferrer"
      style={styles.projectLink}
    >
      {name}
    </a>
  );

  return (
    <>
      <TokenHover symbol={project.tvSymbol}>
        {content}
      </TokenHover>
      {project.twitter && (
        <a
          href={`https://twitter.com/${project.twitter}`}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.twitterSup}
        >
          <sup>@</sup>
        </a>
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MARKDOWN RENDERER
// ─────────────────────────────────────────────────────────────────────────────

const MarkdownContent = ({ content, isTranscript = false }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeLines = [];
  let inTable = false;
  let tableRows = [];
  let isFirstHeading = true;

  const baseStyle = isTranscript ? {
    fontFamily: FONTS.mono,
    fontSize: '13px'
  } : {};

  const flushTable = (key) => {
    if (tableRows.length > 0) {
      const headers = tableRows[0].split('|').filter(c => c.trim()).map(c => c.trim());
      const dataRows = tableRows.slice(2);
      elements.push(
        <div key={key} style={{ overflowX: 'auto', margin: '24px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', fontFamily: FONTS.mono }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.1)' }}>
                {headers.map((h, j) => <th key={j} style={{ textAlign: 'left', padding: '10px 14px', fontWeight: '500' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, ri) => {
                const cells = row.split('|').filter(c => c.trim()).map(c => c.trim());
                return (
                  <tr key={ri} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    {cells.map((cell, ci) => <td key={ci} style={{ padding: '10px 14px' }}>{formatInline(cell)}</td>)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    }
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      if (inTable) flushTable(`table-${i}`);
      if (inCodeBlock) {
        elements.push(
          <pre key={i} style={{ backgroundColor: '#1a1a2e', color: '#e2e8f0', padding: '20px', margin: '24px 0', fontSize: '13px', overflow: 'auto', fontFamily: FONTS.mono, borderRadius: '2px' }}>
            {codeLines.join('\n')}
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) { codeLines.push(line); continue; }

    // Tables
    if (line.trim().startsWith('|') && line.includes('|')) {
      inTable = true;
      tableRows.push(line);
      continue;
    } else if (inTable) {
      flushTable(`table-${i}`);
    }

    // Headers
    if (line.startsWith('# ')) {
      const topMargin = isFirstHeading ? '24px' : '56px';
      isFirstHeading = false;
      elements.push(<h1 key={i} style={{ fontFamily: FONTS.mono, fontSize: '22px', marginTop: topMargin, marginBottom: '20px', fontWeight: '600', letterSpacing: '-0.5px', ...baseStyle }}>{line.slice(2)}</h1>);
      continue;
    }
    if (line.startsWith('## ')) {
      const topMargin = isFirstHeading ? '0' : '36px';
      isFirstHeading = false;
      elements.push(<h2 key={i} style={{ fontFamily: FONTS.mono, fontSize: '19px', marginTop: topMargin, marginBottom: '14px', fontWeight: '500', ...baseStyle }}>{line.slice(3)}</h2>);
      continue;
    }
    if (line.startsWith('### ')) {
      const topMargin = isFirstHeading ? '0' : '28px';
      isFirstHeading = false;
      elements.push(<h3 key={i} style={{ fontFamily: FONTS.mono, fontSize: '15px', marginTop: topMargin, marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', ...baseStyle }}>{line.slice(4)}</h3>);
      continue;
    }

    // HR
    if (line.match(/^[-─═]{3,}$/)) {
      elements.push(<hr key={i} style={{ border: 'none', borderTop: '1px dotted rgba(0,0,0,0.2)', margin: '40px 0' }} />);
      continue;
    }

    // Blockquotes
    if (line.startsWith('>')) {
      elements.push(<blockquote key={i} style={{ borderLeft: '3px solid #3B5FE6', paddingLeft: '20px', margin: '24px 0', fontStyle: 'italic', color: 'rgba(0,0,0,0.75)', ...baseStyle }}>{line.slice(1).trim()}</blockquote>);
      continue;
    }

    // Lists
    if (line.match(/^[-*•]\s/)) {
      elements.push(<li key={i} style={{ marginLeft: '24px', marginBottom: '10px', ...baseStyle }}>{formatInline(line.slice(2))}</li>);
      continue;
    }

    // Empty
    if (!line.trim()) continue;

    // Paragraphs
    elements.push(<p key={i} style={{ marginBottom: '18px', ...baseStyle }}>{formatInline(line)}</p>);
  }

  if (inTable) flushTable('table-end');

  return <div>{elements}</div>;
};

// HTML-only formatting (no React components)
const formatInlineHtml = (text) => {
  // First, handle complete bold markers
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Then strip any orphaned ** markers that remain
  text = text.replace(/\*\*/g, '');
  // Handle italics
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Handle code
  text = text.replace(/`(.+?)`/g, '<code style="font-family: JetBrains Mono, SF Mono, Consolas, monospace; font-size: 0.9em; background: rgba(0,0,0,0.04); padding: 2px 6px; border-radius: 2px;">$1</code>');
  return text;
};

// Format text with ProjectLink components for protocols
const formatContentWithLinks = (text) => {
  if (!text || typeof text !== 'string') return text;

  // Build regex pattern from all project names (sorted by length desc to match longer first)
  const projectNames = Object.keys(PROJECTS);
  const sortedNames = projectNames.sort((a, b) => b.length - a.length);
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Match protocol names, optionally preceded/followed by ** (bold markers)
  // Don't consume surrounding spaces - they stay in beforeText/afterText
  const pattern = new RegExp(`(\\*\\*)?(${sortedNames.map(escapeRegex).join('|')})(\\*\\*)?`, 'g');

  const result = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const [fullMatch, leadingStars, protocolName, trailingStars] = match;
    const matchStart = match.index;

    // Add text before this match
    if (matchStart > lastIndex) {
      const beforeText = text.slice(lastIndex, matchStart);
      const formatted = formatInlineHtml(beforeText);
      result.push(<span key={`text-${lastIndex}`} dangerouslySetInnerHTML={{ __html: formatted }} />);
    }

    // Determine if protocol should be bold (wrapped in **)
    const isBold = leadingStars && trailingStars;

    // Add the ProjectLink, optionally wrapped in strong
    if (isBold) {
      result.push(
        <strong key={`link-${matchStart}`}>
          <ProjectLink name={protocolName} />
        </strong>
      );
    } else {
      // Handle partial bold markers (orphaned ** before or after)
      if (leadingStars && !trailingStars) {
        result.push(<span key={`stars-${matchStart}`} dangerouslySetInnerHTML={{ __html: '<strong>' }} />);
      }
      result.push(<ProjectLink key={`link-${matchStart}`} name={protocolName} />);
      if (!leadingStars && trailingStars) {
        result.push(<span key={`stars-end-${matchStart}`} dangerouslySetInnerHTML={{ __html: '</strong>' }} />);
      }
    }

    lastIndex = matchStart + fullMatch.length;
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    const formatted = formatInlineHtml(remainingText);
    result.push(<span key={`text-${lastIndex}`} dangerouslySetInnerHTML={{ __html: formatted }} />);
  }

  return result.length > 0 ? result : text;
};

// Legacy formatInline for backward compatibility
const formatInline = (text) => {
  return formatContentWithLinks(text);
};

// ─────────────────────────────────────────────────────────────────────────────
// DEEP DIVE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const DeepDive = ({ dive }) => {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isTranscript = dive.id === 'transcript';

  const handleExpand = async () => {
    if (!expanded && !content && !dive.isContent) {
      setLoading(true);
      try {
        const res = await fetch(`/${dive.file}`);
        let text = await res.text();

        // Clean transcript if needed
        if (isTranscript) {
          // Remove Emperor from participants
          text = text.replace(/Emperor,?\s*/g, '');
          // Fix Jun Yi name
          text = text.replace(/Junyi/g, 'Jun Yi');
          // Fix attribution
          text = text.replace(/\*\*Niraj:\*\*\s*\n\s*\nPersonally, I thought it was good/g, '**Daniel:**\n\nPersonally, I thought it was good');
        }

        setContent(text);
      } catch (e) {
        setContent('Error loading document');
      }
      setLoading(false);
    }
    setExpanded(!expanded);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(dive.isContent ? dive.content : content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([dive.isContent ? dive.content : content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dive.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.deepDiveCard}>
      <div style={styles.deepDiveHeader} onClick={handleExpand}>
        <div>
          <h3 style={styles.deepDiveTitle}>{dive.title}</h3>
          <p style={styles.deepDiveSubtitle}>{dive.subtitle}</p>
        </div>
        {expanded ? <ChevronUp size={18} strokeWidth={1.5} /> : <ChevronDown size={18} strokeWidth={1.5} />}
      </div>

      {expanded && (
        <div style={styles.deepDiveContent}>
          {dive.summary && (
            <p style={{ marginBottom: '20px', color: 'rgba(0,0,0,0.65)', fontSize: '16px', lineHeight: '1.65', fontFamily: FONTS.serif }}>{dive.summary}</p>
          )}

          {(dive.file || dive.isContent) && (
            <div style={styles.transcriptControls}>
              <button
                style={styles.controlButton}
                onClick={handleCopy}
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.03)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <Copy size={12} />
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                style={styles.controlButton}
                onClick={handleDownload}
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.03)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <Download size={12} />
                Download .md
              </button>
            </div>
          )}

          <div style={styles.contentArea}>
            {loading ? (
              <p style={{ fontFamily: FONTS.mono, fontSize: '12px', color: 'rgba(0,0,0,0.5)', letterSpacing: '1px' }}>LOADING...</p>
            ) : dive.isContent ? (
              <MarkdownContent content={dive.content} />
            ) : (
              <MarkdownContent content={content} isTranscript={isTranscript} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT VIEWER MODAL (Full-screen with Liquid Glass Blur)
// ─────────────────────────────────────────────────────────────────────────────

const DocumentViewerModal = ({ artifact, onClose }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const res = await fetch(`/${artifact.file}`);
        const text = await res.text();
        setContent(text);
      } catch (e) {
        setContent('Error loading document');
      }
      setLoading(false);
    };
    loadContent();

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [artifact.file]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = artifact.file;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Liquid Glass Blur Backdrop */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(251, 251, 251, 0.75)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)'
        }}
        onClick={onClose}
      />

      {/* Modal Content - Full Screen */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1000px',
          height: '92vh',
          margin: '0 20px',
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '28px 32px 20px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            backgroundColor: '#FAFAFA'
          }}
        >
          <div>
            <h2 style={{
              fontFamily: FONTS.mono,
              fontSize: '18px',
              fontWeight: '600',
              color: '#3B5FE6',
              margin: '0 0 6px 0',
              letterSpacing: '-0.01em'
            }}>
              {artifact.title}
            </h2>
            <p style={{
              fontFamily: FONTS.mono,
              fontSize: '11px',
              fontWeight: '500',
              color: 'rgba(0, 0, 0, 0.45)',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              {artifact.subtitle}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={handleCopy}
              style={{
                ...styles.controlButton,
                padding: '8px 14px',
                fontSize: '10px'
              }}
            >
              <Copy size={12} />
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              style={{
                ...styles.controlButton,
                padding: '8px 14px',
                fontSize: '10px'
              }}
            >
              <Download size={12} />
              .md
            </button>
            <button
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                color: 'rgba(0, 0, 0, 0.5)',
                transition: 'all 0.15s ease',
                marginLeft: '8px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.color = 'rgba(0, 0, 0, 0.8)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'rgba(0, 0, 0, 0.5)';
              }}
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '32px 40px 48px',
            backgroundColor: '#FFFFFF'
          }}
        >
          {loading ? (
            <div style={{
              fontFamily: FONTS.mono,
              fontSize: '12px',
              color: 'rgba(0, 0, 0, 0.5)',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              Loading document...
            </div>
          ) : (
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
              <MarkdownContent content={content} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE ARTIFACTS PANEL (Compact list above Key Findings)
// ─────────────────────────────────────────────────────────────────────────────

const SourceArtifactsPanel = () => {
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      <section style={{
        marginBottom: '56px',
        padding: '24px',
        backgroundColor: 'rgba(59, 95, 230, 0.03)',
        border: '1px solid rgba(59, 95, 230, 0.12)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '16px'
        }}>
          <FileText size={16} strokeWidth={1.5} style={{ color: '#3B5FE6' }} />
          <h3 style={{
            fontFamily: FONTS.mono,
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#3B5FE6',
            margin: 0
          }}>
            Source Artifacts
          </h3>
          <span style={{
            fontFamily: FONTS.mono,
            fontSize: '10px',
            color: 'rgba(0, 0, 0, 0.4)',
            marginLeft: 'auto'
          }}>
            Generated by Claude Cowork
          </span>
        </div>

        <p style={{
          fontFamily: FONTS.serif,
          fontSize: '15px',
          lineHeight: '1.6',
          color: 'rgba(0, 0, 0, 0.65)',
          margin: '0 0 20px 0'
        }}>
          The following documents were generated during the Claude Cowork session and serve as the primary source material for this microsite.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          {SOURCE_ARTIFACTS.map((artifact) => (
            <button
              key={artifact.id}
              onClick={() => setSelectedArtifact(artifact)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '16px',
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'rgba(59, 95, 230, 0.4)';
                e.currentTarget.style.backgroundColor = 'rgba(59, 95, 230, 0.02)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <FileText size={18} strokeWidth={1.5} style={{ color: '#3B5FE6', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{
                  fontFamily: FONTS.mono,
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#171717',
                  marginBottom: '4px'
                }}>
                  {artifact.title}
                </div>
                <div style={{
                  fontFamily: FONTS.mono,
                  fontSize: '10px',
                  color: 'rgba(0, 0, 0, 0.45)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {artifact.subtitle}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {selectedArtifact && (
        <DocumentViewerModal
          artifact={selectedArtifact}
          onClose={() => setSelectedArtifact(null)}
        />
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AGENT/LLM JSON EXPORT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const generateAgentJSON = () => {
  return {
    meta: {
      title: "Ritual Intelligence: RWA × DeFi × AI",
      version: "2026.01.15",
      type: "strategic_research_dossier",
      generated: new Date().toISOString(),
      instructions: "This document is structured for agent/LLM consumption. Follow the meta_prompts sequentially to establish a research workspace."
    },

    meta_prompts: [
      {
        id: "workspace_setup",
        priority: 1,
        instruction: "Create a dedicated workspace for RWA/DeFi research. Structure directories as: /research/rwa, /research/defi, /research/protocols, /analysis/ritual_integration, /tracking/opportunities."
      },
      {
        id: "data_ingestion",
        priority: 2,
        instruction: "Parse the protocols array below. For each S-tier and A-tier protocol, create a tracking file with: name, tvl, category, ritual_integration_potential (high/medium/low), and last_updated timestamp."
      },
      {
        id: "monitoring_setup",
        priority: 3,
        instruction: "Set up monitoring for the following data sources: DefiLlama API for TVL tracking, Twitter/X lists for @maplefinance @OndoFinance @ZivoeProtocol @CredixFinance, Dune Analytics dashboards for on-chain metrics."
      },
      {
        id: "analysis_framework",
        priority: 4,
        instruction: "Apply the following analysis framework to each protocol: (1) Technical fit for Ritual primitives, (2) BD opportunity vs integration opportunity, (3) Timeline to integration, (4) Competitive moat assessment."
      },
      {
        id: "ritual_primitive_mapping",
        priority: 5,
        instruction: "For each protocol in the S-tier, identify which Ritual primitives apply: ONNX Inference (credit scoring, risk pricing), TEE Executors (private computation), HTTP Calls (off-chain verification), Scheduled Tx (automation), Secret Encryption (compliance)."
      },
      {
        id: "opportunity_scoring",
        priority: 6,
        instruction: "Score each integration opportunity on: pain_intensity (1-10), technical_fit (1-10), team_accessibility (1-10), tvl_range, competition_level. Rank by composite score."
      },
      {
        id: "continuous_research",
        priority: 7,
        instruction: "Establish weekly research cadence: Monitor governance forums for protocol roadmaps, Track new protocol launches in RWA category, Update TVL and utilization metrics, Identify emerging self-repaying/streaming patterns."
      }
    ],

    thesis: {
      core: "Intelligence scales infinitely. Trust doesn't. Verification is how they meet.",
      market_position: "RWA TVL crossed $35B in January 2026, representing 7x growth. Asset composition shifted to diversified mix: private credit (28%), real estate (12%), insurance (8%).",
      structural_shift: "Industry pivoted from under-collateralized to asset-backed structures after 2022-23 defaults. Pattern: catastrophe → isolation → maturation.",
      opportunity: "Only Bid.io attempts on-chain AI. Maple, Credix, Zivoe, Goldfinch run credit decisions off-chain. Gap: verifiable inference is infrastructurally necessary."
    },

    tier_list: {
      S: { narratives: ["AI", "RWAs", "Prediction Markets"], thesis: "Structural shift, institutional demand, verifiability premium" },
      A: { narratives: ["Privacy", "Robotics", "Payments/Neobanks"], thesis: "Infrastructure plays, emerging moats, regulatory tailwinds" },
      B: { narratives: ["Perp DEXes", "L1/L2", "DeFi"], thesis: "Maturing markets, selectivity increasing, usage > design" },
      C: { narratives: ["InfoFi", "DePIN", "Interoperability"], thesis: "Real demand, weak token value capture" },
      D: { narratives: ["Gaming", "Memes", "NFTs"], thesis: "Speculative, retail-driven, risk-reward deteriorated" }
    },

    protocols: {
      rwa_core: [
        { name: "Ondo Finance", tvl: "$600M+", category: "Tokenized Treasuries", ritual_fit: "high", primitives: ["ONNX"], notes: "BlackRock BUIDL distribution partner" },
        { name: "Maple Finance", tvl: "~$100M", category: "Institutional Credit", ritual_fit: "high", primitives: ["ONNX", "HTTP"], notes: "0% post-pivot default rate" },
        { name: "Zivoe", tvl: "~$6M", category: "Private Credit", ritual_fit: "very_high", primitives: ["ONNX", "Scheduled Tx"], notes: "95% utilization, spigot mechanism, clearest integration target" },
        { name: "Credix", tvl: "$100M+", category: "Private Credit", ritual_fit: "high", primitives: ["ONNX", "HTTP"], notes: "Future cash flow collateralization, 20%+ historical yields" },
        { name: "Centrifuge", tvl: "varies", category: "RWA Platform", ritual_fit: "medium", primitives: ["ONNX"], notes: "Tranched structures, asset manager focus" }
      ],
      rwa_infrastructure: [
        { name: "Provenance", tvl: "$20B claimed", category: "Financial Services L1", ritual_fit: "high", primitives: ["HTTP", "TEE"], notes: "Insurance vertical 6x growth, event verification use case" },
        { name: "Plume", tvl: "varies", category: "RWA L2", ritual_fit: "medium", primitives: ["TEE", "Secret Encryption"], notes: "Compliance-first, embedded KYC/AML" }
      ],
      adjacent: [
        { name: "Hyperliquid", category: "PerpDEX", ritual_fit: "medium", primitives: ["ONNX", "Scheduled Tx"], notes: "Self-repaying perpetuals concept origin" },
        { name: "EtherFi", category: "Neobank", ritual_fit: "medium", primitives: ["Scheduled Tx"], notes: "Restaking to neobank pivot, cash card" },
        { name: "Aave", category: "DeFi Lending", ritual_fit: "high", primitives: ["ONNX"], notes: "Existing Ritual relationship, RWA expansion surface" }
      ]
    },

    ritual_primitives: {
      ONNX_Inference: { use_cases: ["Credit scoring", "Risk pricing", "Fraud detection"], target_protocols: ["Zivoe", "Maple", "Credix"] },
      TEE_Executors: { use_cases: ["Private computation", "Compliant AI operations"], target_protocols: ["Provenance", "Plume", "Canton Network"] },
      HTTP_Calls: { use_cases: ["Off-chain event verification", "Insurance payouts", "External data"], target_protocols: ["Provenance", "Credix"] },
      Scheduled_Tx: { use_cases: ["Automated loan lifecycle", "Streaming repayment", "Agent operations"], target_protocols: ["Zivoe", "Hyperliquid"] },
      Secret_Encryption: { use_cases: ["Agent identity", "Confidential RWA operations"], target_protocols: ["Plume", "Canton Network"] }
    },

    novel_concepts: {
      self_repaying_perpetuals: {
        description: "Perpetual positions where positive-carry RWA collateral (tokenized treasuries at 4-5%) offsets funding rates",
        origin: "Emerged from analyzing PerpDEX pain points: traders don't want to pay/predict funding or face volatile funding decay",
        mechanism: "PerpDEX + Alchemix mechanics = self-financing positions",
        ritual_angle: "ONNX for collateral optimization, Scheduled Tx for automated rebalancing"
      },
      streaming_repayment: {
        description: "Loan repayment tied to revenue streams rather than time-based obligations",
        example: "Zivoe's spigot mechanism: business pays portion of each sale toward loan",
        ritual_angle: "HTTP calls to verify revenue events, ONNX for cash flow prediction"
      }
    },

    recommendations: [
      { priority: 1, action: "Reference Implementation", detail: "Build verifiable credit scoring for Zivoe or similar ($5-50M TVL). ONNX model for merchant cash advance risk." },
      { priority: 2, action: "Target Segment", detail: "Mid-tier RWA protocols ($5M-$100M TVL) with >70% utilization, discussing scaling constraints, no existing AI partnerships." },
      { priority: 3, action: "Vertical Sequence", detail: "Private credit first (highest pain intensity, best technical fit), insurance second." },
      { priority: 4, action: "DeFi Bridge", detail: "Leverage existing DeFi relationships (Aave, Morpho, Euler) as RWA introduction surfaces." },
      { priority: 5, action: "Positioning", detail: "Hybrid infrastructure + category enabler. Mental model: Chainlink for price feeds, Ritual for intelligence feeds." }
    ],

    key_findings: EXECUTIVE_SUMMARY.keyFindings.map(f => ({ title: f.title, content: f.content.replace(/\*\*/g, '') })),

    deep_dives: DEEP_DIVES.map(d => ({
      id: d.id,
      title: d.title,
      subtitle: d.subtitle,
      type: d.isContent ? 'embedded' : 'file_reference',
      file: d.file || null,
      content_preview: d.isContent ? d.content.slice(0, 500) + '...' : d.summary
    }))
  };
};

const AgentExportButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCopy = () => {
    const json = JSON.stringify(generateAgentJSON(), null, 2);
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const json = JSON.stringify(generateAgentJSON(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ritual-intelligence-agent-context.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed',
          top: isMobile ? 'auto' : '24px',
          bottom: isMobile ? '20px' : 'auto',
          right: isMobile ? '20px' : '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isMobile ? '0' : '8px',
          padding: isMobile ? '10px' : '10px 16px',
          fontSize: '11px',
          fontFamily: FONTS.mono,
          fontWeight: '500',
          letterSpacing: '0.05em',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: isMobile ? '50%' : '0',
          backgroundColor: 'rgba(251,251,251,0.9)',
          cursor: 'pointer',
          color: 'rgba(0,0,0,0.35)',
          transition: 'all 0.15s ease',
          zIndex: 1000,
          backdropFilter: 'blur(8px)',
          opacity: isMobile ? 0.6 : 1
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(59,95,230,0.08)';
          e.currentTarget.style.borderColor = 'rgba(59,95,230,0.3)';
          e.currentTarget.style.color = '#3B5FE6';
          e.currentTarget.style.opacity = '1';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(251,251,251,0.9)';
          e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
          e.currentTarget.style.color = 'rgba(0,0,0,0.35)';
          e.currentTarget.style.opacity = isMobile ? '0.6' : '1';
        }}
      >
        <Bot size={isMobile ? 16 : 14} strokeWidth={1.5} />
        {!isMobile && 'Agent/LLM?'}
      </button>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: '#FBFBFB',
              padding: '40px',
              maxWidth: '520px',
              width: '90%',
              border: '1px solid rgba(0,0,0,0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <Bot size={20} strokeWidth={1.5} style={{ color: '#3B5FE6' }} />
              <h3 style={{ fontFamily: FONTS.mono, fontSize: '16px', fontWeight: '600', margin: 0, color: '#3B5FE6' }}>
                Agent Context Export
              </h3>
            </div>

            <p style={{ fontFamily: FONTS.serif, fontSize: '16px', lineHeight: '1.65', marginBottom: '24px', color: 'rgba(0,0,0,0.75)' }}>
              Export this dossier as structured JSON with embedded meta-prompts to help your agent establish a research workspace and continue investigating this domain.
            </p>

            <div style={{ fontFamily: FONTS.mono, fontSize: '11px', color: 'rgba(0,0,0,0.5)', marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Includes:</div>
              <div>• 7 sequential meta-prompts for workspace setup</div>
              <div>• Protocol data with Ritual primitive mappings</div>
              <div>• Tier list with investment theses</div>
              <div>• Novel concepts (self-repaying perpetuals)</div>
              <div>• Prioritized recommendations</div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleCopy}
                style={{
                  ...styles.controlButton,
                  flex: 1,
                  justifyContent: 'center',
                  padding: '12px 20px',
                  fontSize: '11px'
                }}
              >
                <Copy size={14} />
                {copied ? 'Copied!' : 'Copy JSON'}
              </button>
              <button
                onClick={handleDownload}
                style={{
                  ...styles.controlButton,
                  flex: 1,
                  justifyContent: 'center',
                  padding: '12px 20px',
                  fontSize: '11px',
                  backgroundColor: '#3B5FE6',
                  borderColor: '#3B5FE6',
                  color: '#fff'
                }}
              >
                <Download size={14} />
                Download .json
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '10px',
                fontSize: '11px',
                fontFamily: FONTS.mono,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                color: 'rgba(0,0,0,0.4)'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TEXT SIZE CONTROLS
// ─────────────────────────────────────────────────────────────────────────────

const TextSizeControls = () => {
  const { scale, setScale } = useFontSize();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Hide on mobile - touch gestures work better for zooming
  if (isMobile) return null;

  const decrease = () => setScale(Math.max(0.8, scale - 0.1));
  const increase = () => setScale(Math.min(1.4, scale + 0.1));

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    border: '1px solid rgba(0,0,0,0.12)',
    backgroundColor: 'rgba(251,251,251,0.95)',
    cursor: 'pointer',
    color: 'rgba(0,0,0,0.5)',
    transition: 'all 0.15s ease',
    backdropFilter: 'blur(8px)'
  };

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      left: '24px',
      display: 'flex',
      gap: '1px',
      zIndex: 1000
    }}>
      <button
        onClick={decrease}
        style={{ ...buttonStyle, borderRadius: '4px 0 0 4px' }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(59,95,230,0.08)';
          e.currentTarget.style.color = '#3B5FE6';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(251,251,251,0.95)';
          e.currentTarget.style.color = 'rgba(0,0,0,0.5)';
        }}
        aria-label="Decrease text size"
      >
        <Minus size={14} strokeWidth={2} />
      </button>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 10px',
        fontSize: '10px',
        fontFamily: FONTS.mono,
        fontWeight: '500',
        letterSpacing: '0.05em',
        border: '1px solid rgba(0,0,0,0.12)',
        borderLeft: 'none',
        borderRight: 'none',
        backgroundColor: 'rgba(251,251,251,0.95)',
        color: 'rgba(0,0,0,0.5)',
        minWidth: '42px'
      }}>
        {Math.round(scale * 100)}%
      </div>
      <button
        onClick={increase}
        style={{ ...buttonStyle, borderRadius: '0 4px 4px 0' }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(59,95,230,0.08)';
          e.currentTarget.style.color = '#3B5FE6';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(251,251,251,0.95)';
          e.currentTarget.style.color = 'rgba(0,0,0,0.5)';
        }}
        aria-label="Increase text size"
      >
        <Plus size={14} strokeWidth={2} />
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSIVE STYLES (CSS-in-JS with media query handling)
// ─────────────────────────────────────────────────────────────────────────────

const useResponsiveStyles = (scale) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return {
    page: {
      ...styles.page,
      fontSize: `${17 * scale}px`,
    },
    container: {
      ...styles.container,
      padding: isMobile ? '40px 20px 80px' : '80px 48px 120px',
      maxWidth: isMobile ? '100%' : '880px'
    },
    title: {
      ...styles.title,
      fontSize: isMobile ? `${32 * scale}px` : `${56 * scale}px`,
    },
    subtitle: {
      ...styles.subtitle,
      fontSize: isMobile ? `${10 * scale}px` : `${12 * scale}px`,
    },
    thesis: {
      ...styles.thesis,
      fontSize: isMobile ? `${18 * scale}px` : `${22 * scale}px`,
      padding: isMobile ? '32px 16px' : '48px 40px',
    },
    sectionTitle: {
      ...styles.sectionTitle,
      fontSize: isMobile ? `${12 * scale}px` : `${14 * scale}px`,
    },
    cardTitle: {
      ...styles.cardTitle,
      fontSize: isMobile ? `${13 * scale}px` : `${14 * scale}px`,
    },
    cardContent: {
      ...styles.cardContent,
      fontSize: `${17 * scale}px`,
      paddingLeft: isMobile ? '16px' : '25px',
    },
    deepDiveTitle: {
      ...styles.deepDiveTitle,
      fontSize: isMobile ? `${14 * scale}px` : `${16 * scale}px`,
    },
    deepDiveHeader: {
      ...styles.deepDiveHeader,
      padding: isMobile ? '16px 20px' : '24px 28px',
    },
    deepDiveContent: {
      ...styles.deepDiveContent,
      padding: isMobile ? '0 20px 20px' : '0 28px 28px',
    },
    contentArea: {
      ...styles.contentArea,
      fontSize: `${17 * scale}px`,
    },
    isMobile
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [scale, setScale] = useState(1);
  const responsiveStyles = useResponsiveStyles(scale);

  return (
    <FontSizeContext.Provider value={{ scale, setScale }}>
      <div style={responsiveStyles.page}>
        <TextSizeControls />
        <AgentExportButton />
        <div style={responsiveStyles.container}>
          {/* Header */}
          <header style={styles.header}>
            <h1 style={responsiveStyles.title}>{EXECUTIVE_SUMMARY.title}</h1>
            <p style={responsiveStyles.subtitle}>{EXECUTIVE_SUMMARY.subtitle}</p>
          </header>

          {/* Thesis */}
          <p style={responsiveStyles.thesis}>{EXECUTIVE_SUMMARY.thesis}</p>

          {/* Source Artifacts Panel */}
          <SourceArtifactsPanel />

          {/* Key Findings */}
          <section style={styles.section}>
            <h2 style={responsiveStyles.sectionTitle}>Key Findings</h2>
            {EXECUTIVE_SUMMARY.keyFindings.map((finding, i) => (
              <div key={i} style={styles.card}>
                <div style={responsiveStyles.cardTitle}>
                  <span style={styles.cardBullet}>→</span>
                  {finding.title}
                </div>
                <p style={responsiveStyles.cardContent}>{formatInline(finding.content)}</p>
              </div>
            ))}
          </section>

          {/* Recommendations */}
          <section style={styles.section}>
            <h2 style={responsiveStyles.sectionTitle}>Recommendations</h2>
            {EXECUTIVE_SUMMARY.recommendations.map((rec, i) => (
              <div key={i} style={styles.card}>
                <div style={responsiveStyles.cardTitle}>
                  <span style={styles.cardBullet}>◆</span>
                  {rec.title}
                </div>
                <p style={responsiveStyles.cardContent}>{formatInline(rec.content)}</p>
              </div>
            ))}
          </section>

          {/* Deep Dives */}
          <section style={styles.section}>
            <h2 style={responsiveStyles.sectionTitle}>Deep Dives</h2>
            {DEEP_DIVES.map(dive => (
              <DeepDive key={dive.id} dive={dive} />
            ))}
          </section>

          {/* Footer */}
          <footer style={{
            marginTop: '48px',
            paddingTop: '32px',
            borderTop: '1px dotted rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}>
            <p style={{
              fontFamily: FONTS.mono,
              fontSize: '10px',
              letterSpacing: '2px',
              color: 'rgba(0,0,0,0.4)',
              textTransform: 'uppercase'
            }}>
              Internal Strategy Document · January 2026
            </p>
          </footer>
        </div>
      </div>
    </FontSizeContext.Provider>
  );
}
