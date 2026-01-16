// Prompt template for extracting entities and opportunities from research artifacts

export function buildEntityExtractionPrompt(
  intelligenceBrief: string,
  narrativeResearch: string | null
): string {
  const narrativeSection = narrativeResearch
    ? `## Source 2: Narrative Research
${narrativeResearch}`
    : '';

  return `You are an entity and opportunity extraction specialist. Extract all named entities and identify potential opportunities from the research documents below.

## Source 1: Intelligence Brief
${intelligenceBrief}

${narrativeSection}

## Task 1: Entity Extraction
Extract ALL entities mentioned in the documents. For each entity, provide:

1. **canonicalName**: The official/most common name
2. **aliases**: Alternative names, abbreviations, or references (e.g., "BTC" for "Bitcoin")
3. **type**: One of: company, protocol, person, concept, opportunity
4. **url**: Official website if known (or null)
5. **twitter**: Twitter/X handle without @ if known (or null)
6. **category**: Sub-category (e.g., "DeFi", "TradFi", "Infrastructure")
7. **description**: 1-2 sentence description based on the documents
8. **sentiment**: How the documents portray this entity: positive, neutral, or negative
9. **mentions**: Array of contexts where this entity appears (max 3 most significant)

## Entity Type Guidelines

- **company**: Traditional companies, institutions, asset managers (BlackRock, Franklin Templeton)
- **protocol**: DeFi protocols, blockchain networks, smart contract systems (Ondo, Centrifuge, Aave)
- **person**: Individuals mentioned by name
- **concept**: Market themes, technologies, strategies (RWA, Tokenization, Private Credit)
- **opportunity**: Investment opportunities, market gaps, action items identified

## Task 2: Opportunity Identification
In addition to entities, identify potential opportunities:
- Business development targets (companies to partner with)
- Product ideas mentioned
- Research questions worth exploring

For each opportunity, provide:
- **name**: Short descriptive name
- **thesis**: Core value proposition (2-3 sentences)
- **angle**: Outreach hook or timing rationale
- **confidence**: 0-100 score based on evidence strength
- **linked_entities**: Array of entity canonicalNames this relates to

## Output Format

Return a JSON object with this structure:
\`\`\`json
{
  "entities": [
    {
      "canonicalName": "Ondo Finance",
      "aliases": ["Ondo", "ONDO"],
      "type": "protocol",
      "url": "https://ondo.finance",
      "twitter": "OndoFinance",
      "category": "DeFi - RWA",
      "description": "Leading RWA tokenization platform focused on bringing institutional-grade financial products on-chain.",
      "sentiment": "positive",
      "mentions": [
        {
          "context": "Ondo Finance leading the tokenized treasury market with $1.93B TVL",
          "section": "Intelligence Brief"
        }
      ]
    }
  ],
  "opportunities": [
    {
      "name": "Ondo Finance Partnership",
      "thesis": "Ondo's dominant position in tokenized treasuries ($1.93B TVL) and their institutional-grade infrastructure makes them an ideal partner for expanding Ritual's RWA capabilities.",
      "angle": "Recent USDY launch shows openness to new distribution channels. Their BD team is actively seeking new integrations.",
      "confidence": 85,
      "linked_entities": ["Ondo Finance"]
    }
  ]
}
\`\`\`

## Rules

### Entities
- Extract ALL entities, including those mentioned only once
- Prefer official names over abbreviations for canonicalName
- Include ticker symbols in aliases (e.g., "BTC", "ETH", "ONDO")
- Set url/twitter to null if not explicitly stated or commonly known
- Derive sentiment from how the entity is portrayed in context
- Keep descriptions factual, based only on document content

### Opportunities
- Focus on actionable business development opportunities
- Only include opportunities with concrete evidence in the documents
- Set confidence based on strength of evidence (high: 80+, medium: 50-79, low: <50)
- Link to relevant entities mentioned in the documents
- Be specific about the angle/timing for outreach

Return ONLY the JSON object, no additional text.`;
}
