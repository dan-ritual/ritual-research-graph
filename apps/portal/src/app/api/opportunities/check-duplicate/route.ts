import { getSchemaTable, resolveMode } from "@/lib/db";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  // Middleware handles auth - use service client for fast DB access
  const supabase = createServiceClient();

  // Resolve mode from header or cookie
  const mode = await resolveMode();

  const body = await request.json();
  const { name, thesis } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Fetch all active opportunities
  const { data: existingOpportunities, error: fetchError } = await supabase
    .from(getSchemaTable("opportunities", mode))
    .select("id, name, thesis")
    .eq("status", "active");

  if (fetchError) {
    console.error("Failed to fetch opportunities:", fetchError);
    return NextResponse.json(
      { error: "Failed to fetch opportunities" },
      { status: 500 }
    );
  }

  // If no existing opportunities, no duplicates possible
  if (!existingOpportunities || existingOpportunities.length === 0) {
    return NextResponse.json({
      is_duplicate: false,
      match_id: null,
      confidence: 0,
      reasoning: "No existing opportunities to compare against",
    });
  }

  // Format existing opportunities for prompt
  const existingList = existingOpportunities
    .map((opp) => `- ID: ${opp.id} | ${opp.name} - ${opp.thesis || "No thesis"}`)
    .join("\n");

  // Check for duplicates via Claude
  const prompt = `Compare this new opportunity against existing opportunities:

New: ${name} - ${thesis || "No thesis provided"}

Existing:
${existingList}

Identify if this is a duplicate or near-duplicate.
Return ONLY valid JSON in this exact format, no other text:
{"is_duplicate": boolean, "match_id": "uuid or null", "confidence": 0-100, "reasoning": "string"}

Be strict: only flag as duplicate if the opportunities clearly refer to the same target or initiative.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
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
    let result: {
      is_duplicate: boolean;
      match_id: string | null;
      confidence: number;
      reasoning: string;
    };
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      result = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse duplicate check JSON:", parseError);
      return NextResponse.json({
        is_duplicate: false,
        match_id: null,
        confidence: 0,
        reasoning: "Failed to analyze - proceeding without duplicate check",
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Claude API error:", error);
    // Fail open - allow creation if API fails
    return NextResponse.json({
      is_duplicate: false,
      match_id: null,
      confidence: 0,
      reasoning: "API error - proceeding without duplicate check",
    });
  }
}
