# SPEC_FUTURE_AI_CROSSLINKS: AI-Native Cross-Mode Linking

> **Status:** Future (Pending Elicitation)
> **Phase:** Post-Phase 4
> **Trigger:** After Phase 4 manual cross-linking is working
> **Dependencies:** Phase 4 Cross-Linking complete, shared.cross_links table in use

---

## Overview

This spec defines the AI-assisted cross-mode linking system that can:
1. **Suggest** links for user approval
2. **Automatically** create links above a confidence threshold

This is a **value multiplier** — the cross-mode linking is where Ritual OS becomes an organizational nervous system. Manual linking proves the concept; AI linking scales it.

---

## Current State (Phase 4)

Manual-only cross-mode linking:

```typescript
// User explicitly creates links
await supabase.from('shared.cross_links').insert({
  source_mode: 'growth',
  source_id: ondoFinanceId,
  target_mode: 'product',
  target_id: treasuryIdeaId,
  link_type: 'inspired_by',
  created_by: userId,
  confidence: null  // Manual = no confidence score
});
```

---

## Target State

AI-assisted linking with configurable modes:

### Mode 1: Suggested Links

AI generates link suggestions, user approves/rejects:

```typescript
interface LinkSuggestion {
  id: string;
  source: { mode: string; id: string; name: string };
  target: { mode: string; id: string; name: string };
  link_type: string;
  confidence: number;
  reasoning: string;
  status: 'pending' | 'approved' | 'rejected';
  suggested_at: Date;
  resolved_at?: Date;
  resolved_by?: string;
}
```

### Mode 2: Automatic Links

AI creates links above threshold without user intervention:

```typescript
interface AutoLinkConfig {
  enabled: boolean;
  confidence_threshold: number;  // e.g., 0.85
  link_types: string[];          // Which link types to auto-create
  require_same_user: boolean;    // Only auto-link user's own entities?
  cooldown_hours: number;        // Prevent spam
}
```

---

## Link Discovery Algorithm

### Trigger Points

Links are discovered at these moments:
1. **Entity creation** — New entity compared against existing cross-mode entities
2. **Batch processing** — Periodic scan for missed connections
3. **User request** — "Find links for this entity"

### Discovery Process

```typescript
async function discoverCrossLinks(entity: Entity): Promise<LinkSuggestion[]> {
  const suggestions: LinkSuggestion[] = [];

  // Get entities from OTHER modes
  const otherModeEntities = await getEntitiesFromOtherModes(entity.mode);

  // Build context for Claude
  const prompt = buildLinkDiscoveryPrompt(entity, otherModeEntities);

  // Call Claude for link suggestions
  const response = await claude.messages.create({
    model: 'claude-sonnet-4-20250514',
    messages: [{ role: 'user', content: prompt }],
    // ...
  });

  // Parse and score suggestions
  const rawSuggestions = parseSuggestions(response);

  for (const suggestion of rawSuggestions) {
    suggestions.push({
      ...suggestion,
      confidence: calculateConfidence(suggestion, entity),
    });
  }

  return suggestions;
}
```

### Confidence Scoring

Confidence is calculated from multiple signals:

| Signal | Weight | Description |
|--------|--------|-------------|
| Name similarity | 0.2 | Fuzzy match on entity names |
| Field overlap | 0.2 | Matching metadata fields |
| Temporal proximity | 0.1 | Created around same time |
| User overlap | 0.1 | Same creator/owner |
| AI reasoning quality | 0.3 | Claude's explanation strength |
| Historical accuracy | 0.1 | How accurate past suggestions were |

```typescript
function calculateConfidence(suggestion: RawSuggestion, entity: Entity): number {
  let score = 0;

  // Name similarity (Levenshtein distance normalized)
  score += 0.2 * calculateNameSimilarity(entity.name, suggestion.targetName);

  // Field overlap
  score += 0.2 * calculateFieldOverlap(entity.metadata, suggestion.targetMetadata);

  // Temporal proximity (closer = higher)
  score += 0.1 * calculateTemporalScore(entity.createdAt, suggestion.targetCreatedAt);

  // User overlap
  score += 0.1 * (entity.createdBy === suggestion.targetCreatedBy ? 1 : 0);

  // AI reasoning quality (heuristic based on explanation length and specificity)
  score += 0.3 * evaluateReasoningQuality(suggestion.reasoning);

  // Historical accuracy (requires feedback loop)
  score += 0.1 * getHistoricalAccuracy(entity.mode, suggestion.targetMode);

  return Math.min(1, Math.max(0, score));
}
```

---

## Admin Configuration

Admin panel to configure AI linking behavior:

```typescript
interface CrossLinkAdminConfig {
  // Global settings
  ai_linking_enabled: boolean;

  // Per-mode settings
  modes: {
    [modeId: string]: {
      suggest_enabled: boolean;
      auto_enabled: boolean;
      auto_threshold: number;
    };
  };

  // Link type settings
  link_types: {
    [linkType: string]: {
      suggest_enabled: boolean;
      auto_enabled: boolean;
      auto_threshold: number;
    };
  };

  // Rate limiting
  max_suggestions_per_entity: number;
  max_auto_links_per_hour: number;
}
```

---

## UI Components

### Suggestion Review Panel

```
┌─────────────────────────────────────────────────────────────┐
│  🔗 Suggested Links for "Ondo Finance"                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 💡 "Treasury Integration" (Skunkworks Idea)           │  │
│  │ Link type: inspired_by                                │  │
│  │ Confidence: 87%                                       │  │
│  │                                                       │  │
│  │ Reasoning: Both discuss tokenized treasury products.  │  │
│  │ Ondo's T-bill tokens mentioned in idea description.   │  │
│  │                                                       │  │
│  │ [✓ Approve]  [✗ Reject]  [View Details]              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 🔧 "RWA Module" (Engineering Feature)                 │  │
│  │ Link type: relates_to                                 │  │
│  │ Confidence: 72%                                       │  │
│  │ ...                                                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Notification Badge

Show pending suggestions count in navigation:
- "Links (3)" badge when suggestions are pending
- Clear when all reviewed

---

## Feedback Loop

To improve confidence scoring over time:

```sql
CREATE TABLE shared.link_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID REFERENCES shared.link_suggestions(id),
  action TEXT NOT NULL,  -- 'approved', 'rejected', 'deleted_later'
  feedback_at TIMESTAMPTZ DEFAULT NOW(),
  feedback_by UUID REFERENCES shared.users(id)
);
```

Use feedback to:
1. Adjust confidence weights
2. Improve AI prompts
3. Filter low-quality link types

---

## Open Questions (For Elicitation When Triggered)

1. **Confidence threshold:** What's the right threshold for auto-linking? 0.85? 0.9?
2. **Notification UX:** How to surface suggestions without being annoying?
3. **Batch vs real-time:** Should discovery run on entity creation or in batches?
4. **Link type restrictions:** Are some link types too risky for auto-creation?
5. **Cross-mode permissions:** Can AI link entities user doesn't own?
6. **Reasoning visibility:** Show AI reasoning to users or hide it?
7. **Rate limits:** How many auto-links per hour is too many?

---

## Win Conditions

- [ ] AI can suggest links with >70% user approval rate
- [ ] Auto-linking creates useful connections at 85%+ confidence
- [ ] Users can easily review and bulk-approve/reject suggestions
- [ ] Admin can configure thresholds per mode and link type
- [ ] Feedback loop improves accuracy over time
- [ ] No spam or low-quality link floods

---

## Effort Estimate

| Task | Duration | Dependencies |
|------|----------|--------------|
| Link discovery algorithm | 3d | Phase 4 complete |
| Confidence scoring | 2d | Discovery |
| Suggestion UI | 3d | Scoring |
| Auto-link system | 2d | Suggestion UI |
| Admin config UI | 2d | Auto-link |
| Feedback loop | 2d | Admin UI |
| Tuning & testing | 3d | All above |

**Total:** ~17 days

---

## Notes

This spec is intentionally deferred to post-Phase 4. Manual linking must work first to:
1. Prove the cross-linking concept has value
2. Generate training data for AI suggestions
3. Establish user expectations for link quality

Do not implement AI linking until manual linking is actively used by the team.
