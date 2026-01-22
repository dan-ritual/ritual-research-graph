# SPEC_3_ENGINEERING: Ritual Engineering Graph

> **Status:** Draft (Pending Phase 1-2 Completion)
> **Phase:** 3
> **Dependencies:** Phase 1 (Mode System), Phase 2 (Growth Complete)
> **Blocks:** None (parallel with Phase 4)

---

## Overview

Build the Engineering mode that transforms engineering meeting transcripts into a living wiki of topics, decisions, and feature tracking with one-way Asana integration.

---

## Win Conditions

- [ ] Google Meet transcripts ingestable via Google Drive API
- [ ] Topics, Decisions, and Features extracted from transcripts
- [ ] Wiki pages generated per topic with linked content
- [ ] Decision log in ADR format
- [ ] Feature board with status tracking
- [ ] One-way Asana task import
- [ ] All Engineering UI in green theme

---

## Satisfaction Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Extraction accuracy | Manual review of 10 transcripts | 85% entity accuracy |
| Wiki coverage | Topics mentioned → Wiki pages | 100% |
| Asana sync latency | Time from Asana change to Graph | < 15 minutes |
| User adoption | Weekly active users | Team-wide |

---

## Scope Boundaries

**In Scope:**
- Google Meet transcript ingestion
- Topic/Decision/Feature/Component entity types
- Claude-based extraction pipeline
- Wiki page generation
- Decision log (ADR-style)
- Feature status board
- One-way Asana import
- Engineering UI views

**Out of Scope:**
- Real-time meeting transcription (use Gemini)
- Two-way Asana sync
- Video/audio processing
- Slack integration
- Jira integration

---

## Entity Types

### Feature

```typescript
interface Feature {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'review' | 'done' | 'blocked';
  owner: string;
  epic?: string;
  asana_task_id?: string;
  related_topics: string[];
  related_decisions: string[];
  created_at: Date;
  updated_at: Date;
}
```

### Topic

```typescript
interface Topic {
  id: string;
  name: string;
  description: string;
  category: 'architecture' | 'infrastructure' | 'frontend' | 'backend' | 'devops' | 'process';
  wiki_content: string;  // Markdown
  related_features: string[];
  mentions: TopicMention[];  // When/where mentioned
  created_at: Date;
  updated_at: Date;
}

interface TopicMention {
  transcript_id: string;
  timestamp: string;
  context: string;  // Surrounding text
}
```

### Decision

```typescript
interface Decision {
  id: string;
  title: string;
  status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
  context: string;      // Why we needed to decide
  decision: string;     // What we decided
  consequences: string; // Expected outcomes
  related_topics: string[];
  superseded_by?: string;
  transcript_id: string;
  decided_at: Date;
  created_at: Date;
}
```

### Component

```typescript
interface Component {
  id: string;
  name: string;
  type: 'service' | 'library' | 'api' | 'ui' | 'database' | 'infrastructure';
  description: string;
  repository?: string;
  dependencies: string[];  // Other component IDs
  owned_by: string;
  related_features: string[];
  created_at: Date;
  updated_at: Date;
}
```

---

## Pipeline Stages

### Stage 1: Transcript Ingestion

**Input:** Google Meet transcript (via Drive API)
**Output:** Structured transcript with speaker labels

```typescript
interface TranscriptInput {
  meeting_title: string;
  date: Date;
  attendees: string[];
  transcript_text: string;  // Line-by-line with timestamps
  auto_summary?: string;    // Gemini-generated
}
```

### Stage 2: Topic Extraction

**Provider:** Claude
**Input:** Transcript
**Output:** Extracted topics with mentions

**Prompt Strategy:**
1. Identify technical topics discussed
2. Categorize by domain (arch, infra, frontend, etc.)
3. Extract context around each mention
4. Identify relationships between topics

### Stage 3: Decision Identification

**Provider:** Claude
**Input:** Transcript + Topics
**Output:** Decisions in ADR format

**Prompt Strategy:**
1. Find moments where decisions were made
2. Identify context (why deciding)
3. Extract the actual decision
4. Note consequences discussed
5. Link to relevant topics

### Stage 4: Feature Linking

**Provider:** Claude
**Input:** Transcript + Topics + Decisions
**Output:** Feature references and status updates

**Prompt Strategy:**
1. Identify features mentioned
2. Extract status updates ("we shipped X", "Y is blocked")
3. Link features to topics and decisions
4. Identify owners mentioned

### Stage 5: Wiki Generation

**Provider:** Claude
**Input:** Topic entity
**Output:** Wiki page markdown

**Template:**
```markdown
# {Topic Name}

## Overview
{Generated summary}

## Related Features
{List with status}

## Key Decisions
{ADR links}

## Recent Discussions
{Transcript excerpts}

## See Also
{Related topics}
```

### Stage 6: Asana Sync

**Type:** One-way import
**Source:** Asana project (engineering kanban)
**Target:** Feature entities

**Sync Logic:**
1. Poll Asana API on schedule (every 15 min)
2. Create/update Feature entities from tasks
3. Map Asana status → Feature status
4. Don't push changes back to Asana

---

## Google Integration

### Google Drive API

**Scopes needed:**
- `drive.readonly` - Read transcript files
- `drive.file` - Access specific folders

**Implementation:**
```typescript
// Using Google Drive API v3
async function listTranscripts(folderId: string): Promise<TranscriptFile[]> {
  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.document'`,
    fields: 'files(id, name, createdTime, modifiedTime)',
  });
  return response.data.files;
}

async function getTranscriptContent(fileId: string): Promise<string> {
  const response = await drive.files.export({
    fileId,
    mimeType: 'text/plain',
  });
  return response.data;
}
```

### Authentication

- Service account for backend processing
- OAuth for user-initiated imports
- Store refresh tokens securely

---

## Asana Integration

### One-Way Sync Architecture

```
Asana Project
    │
    ▼ (poll every 15 min)
Sync Worker
    │
    ▼ (create/update)
engineering.features
```

### Mapping

| Asana Field | Feature Field |
|-------------|---------------|
| name | name |
| notes | description |
| assignee | owner |
| section | status (mapped) |
| gid | asana_task_id |
| tags | (ignored for now) |

### Section → Status Mapping

```typescript
const statusMap: Record<string, FeatureStatus> = {
  'Backlog': 'planning',
  'In Progress': 'in_progress',
  'In Review': 'review',
  'Done': 'done',
  'Blocked': 'blocked',
};
```

---

## UI Views

### Engineering Dashboard

- Recent meetings processed
- Topic cloud / category breakdown
- Recent decisions
- Feature status summary

### Wiki View

- Topic list with search
- Topic detail page (generated wiki content)
- Topic graph visualization (optional)

### Decision Log

- Chronological list
- Filter by status, topic
- ADR detail view

### Feature Board

- Kanban view by status
- List view with filters
- Feature detail with related topics/decisions
- Asana sync indicator

---

## Open Questions

> To be resolved in Phase 3 elicitation.

1. **Transcript folder structure:** Single folder or organized by date/project?
2. **Meeting title parsing:** How to identify meeting purpose from title?
3. **Speaker identification:** Match speakers to team members?
4. **Topic merging:** How to handle similar topics ("auth" vs "authentication")?
5. **Decision conflicts:** What if two meetings have conflicting decisions?
6. **Feature creation:** Auto-create features or suggest only?

---

## Database Schema

```sql
-- engineering.entities (generic, mode-specific)
CREATE TABLE engineering.entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('feature', 'topic', 'decision', 'component')),
  name TEXT NOT NULL,
  data JSONB NOT NULL,  -- Type-specific fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- engineering.transcripts
CREATE TABLE engineering.transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  meeting_date DATE NOT NULL,
  attendees TEXT[],
  content TEXT NOT NULL,
  auto_summary TEXT,
  gdrive_file_id TEXT UNIQUE,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- engineering.wiki_pages
CREATE TABLE engineering.wiki_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES engineering.entities(id),
  content TEXT NOT NULL,  -- Markdown
  version INT DEFAULT 1,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- engineering.entity_mentions
CREATE TABLE engineering.entity_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES engineering.entities(id),
  transcript_id UUID REFERENCES engineering.transcripts(id),
  context TEXT,  -- Surrounding text
  timestamp TEXT,  -- Meeting timestamp if available
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Testing Strategy

- Unit tests for extraction prompts (mock Claude responses)
- Integration tests for Google Drive API
- Integration tests for Asana API
- E2E tests for full transcript → wiki flow
- Manual review of extraction quality

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Transcripts processed | 50+ | Count in DB |
| Topics extracted | 100+ | Unique topics |
| Decisions logged | 20+ | Decision entities |
| Wiki page quality | Useful | User feedback |
| Team adoption | 80% | WAU/team size |
