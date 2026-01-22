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

  // Fetch opportunity with linked entities
  const { data: opportunity, error: oppError } = await supabase
    .schema(mode)
    .from("opportunities")
    .select("*")
    .eq("id", id)
    .single();

  if (oppError || !opportunity) {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }

  // Fetch linked entities
  const { data: linkedEntities } = await supabase
    .schema(mode)
    .from("opportunity_entities")
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

  // Fetch source microsite context if available
  let micrositeContext = "";
  if (opportunity.source_microsite_id) {
    const { data: microsite } = await supabase
      .schema(mode)
      .from("microsites")
      .select("title, thesis")
      .eq("id", opportunity.source_microsite_id)
      .single();

    if (microsite) {
      micrositeContext = `Source: "${microsite.title}" - ${microsite.thesis}`;
    }
  }

  // Generate strategy via Claude
  const prompt = `Create a strategic approach document for this opportunity:

Opportunity: ${opportunity.name}
Thesis: ${opportunity.thesis || "Not specified"}
Angle: ${opportunity.angle || "Not specified"}
Linked Entities: ${entityList}
${micrositeContext ? `Source Research: ${micrositeContext}` : ""}

Structure:
1. EXECUTIVE SUMMARY (2-3 sentences)
2. VALUE PROPOSITION (Why this matters for Ritual)
3. APPROACH STRATEGY (How to engage)
4. OBJECTION HANDLING (Anticipated concerns + responses)
5. NEXT STEPS (3 concrete actions)

Output as clean markdown.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const strategy =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Store result in database
    const { error: updateError } = await supabase
      .schema(mode)
      .from("opportunities")
      .update({ strategy })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to save strategy:", updateError);
      return NextResponse.json(
        { error: "Failed to save strategy" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, strategy });
  } catch (error) {
    console.error("Claude API error:", error);
    return NextResponse.json(
      { error: "Failed to generate strategy" },
      { status: 500 }
    );
  }
}
