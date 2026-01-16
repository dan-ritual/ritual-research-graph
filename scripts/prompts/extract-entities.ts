// Prompt template for extracting entities from research artifacts

export function buildEntityExtractionPrompt(
  intelligenceBrief: string,
  narrativeResearch: string | null
): string {
  const narrativeSection = narrativeResearch
    ? `## Source 2: Narrative Research
${narrativeResearch}`
    : '';

  return `You are an entity extraction specialist. Extract all named entities from the research documents below.

## Source 1: Intelligence Brief
${intelligenceBrief}

${narrativeSection}

## Task
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
  ]
}
\`\`\`

## Rules

- Extract ALL entities, including those mentioned only once
- Prefer official names over abbreviations for canonicalName
- Include ticker symbols in aliases (e.g., "BTC", "ETH", "ONDO")
- Set url/twitter to null if not explicitly stated or commonly known
- Derive sentiment from how the entity is portrayed in context
- Keep descriptions factual, based only on document content

Return ONLY the JSON object, no additional text.`;
}
