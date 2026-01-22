import { getSchemaTable } from "@/lib/db";
import { resolveMode } from "@/lib/db.server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Middleware handles auth - use service client for fast DB access
  const supabase = createServiceClient();

  // Resolve mode from header or cookie
  const mode = await resolveMode();

  // Fetch opportunity with stage info
  const { data: opportunity, error: oppError } = await supabase
    .from(getSchemaTable("opportunities", mode))
    .select(`
      *,
      stage:pipeline_stages(name, slug)
    `)
    .eq("id", id)
    .single();

  if (oppError || !opportunity) {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }

  // Fetch linked entities
  const { data: linkedEntities } = await supabase
    .from(getSchemaTable("opportunity_entities", mode))
    .select(`
      relationship,
      entity:entities(name, type, slug)
    `)
    .eq("opportunity_id", id);

  const entityList = linkedEntities
    ?.map((e) => {
      // Supabase returns entity as object or array depending on join type
      const entityRaw = e.entity;
      const entity = Array.isArray(entityRaw) ? entityRaw[0] : entityRaw;
      if (!entity || typeof entity !== "object") return null;
      const { name, type } = entity as { name: string; type: string };
      return `${name} (${type})`;
    })
    .filter(Boolean)
    .join(", ") || "None linked";

  const stageName = (opportunity.stage as { name: string; slug: string } | null)?.name || "Unknown";

  // Generate email via Claude
  const prompt = `Generate an outreach email for this opportunity:

Opportunity: ${opportunity.name}
Thesis: ${opportunity.thesis || "Not specified"}
Angle: ${opportunity.angle || "Not specified"}
Linked Entities: ${entityList}
Stage: ${stageName}

Requirements:
- Professional but warm tone
- Reference specific value proposition
- Clear call to action
- Under 200 words

Return ONLY valid JSON in this exact format, no other text:
{"subject": "string", "body": "string"}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON response
    let emailDraft: { subject: string; body: string };
    try {
      // Extract JSON from the response (handle potential markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      emailDraft = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse email JSON:", parseError, responseText);
      return NextResponse.json(
        { error: "Failed to parse email response" },
        { status: 500 }
      );
    }

    // Store result in database
    const { error: updateError } = await supabase
      .from(getSchemaTable("opportunities", mode))
      .update({ email_draft: emailDraft })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to save email draft:", updateError);
      return NextResponse.json(
        { error: "Failed to save email draft" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, emailDraft });
  } catch (error) {
    console.error("Claude API error:", error);
    return NextResponse.json(
      { error: "Failed to generate email" },
      { status: 500 }
    );
  }
}
