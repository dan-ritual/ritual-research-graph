import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  // Middleware handles auth - use service client for fast DB access
  const supabase = createServiceClient();

  const body = await request.json();
  const { query } = body;

  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  // Fetch all active opportunities with related data
  const { data: opportunities, error: fetchError } = await supabase
    .from("opportunities")
    .select(`
      id,
      name,
      thesis,
      angle,
      confidence,
      status,
      created_at,
      updated_at,
      workflow:pipeline_workflows(name, slug),
      stage:pipeline_stages(name, slug)
    `)
    .not("status", "eq", "archived")
    .order("updated_at", { ascending: false });

  if (fetchError) {
    console.error("Failed to fetch opportunities:", fetchError);
    return NextResponse.json(
      { error: "Failed to fetch opportunities" },
      { status: 500 }
    );
  }

  // Format opportunities for prompt
  const opportunitiesContext = opportunities
    ?.map((opp) => {
      // Supabase returns nested objects as object or array depending on join type
      const workflowRaw = opp.workflow;
      const stageRaw = opp.stage;
      const workflow = Array.isArray(workflowRaw) ? workflowRaw[0] : workflowRaw;
      const stage = Array.isArray(stageRaw) ? stageRaw[0] : stageRaw;
      const workflowName = workflow && typeof workflow === "object"
        ? (workflow as { name: string }).name : "Unknown";
      const stageName = stage && typeof stage === "object"
        ? (stage as { name: string }).name : "Unknown";
      return JSON.stringify({
        id: opp.id,
        name: opp.name,
        thesis: opp.thesis || "Not specified",
        angle: opp.angle || "Not specified",
        confidence: opp.confidence,
        workflow: workflowName,
        stage: stageName,
        updated_at: opp.updated_at,
      });
    })
    .join("\n") || "No opportunities found.";

  // Generate response via Claude
  const prompt = `You are an assistant helping query the opportunity pipeline.

Available opportunities:
${opportunitiesContext}

User question: ${query}

Answer concisely based on the data. If the question requires filtering or aggregation, compute it from the data provided. Format your response clearly with markdown if helpful.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const response =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Claude API error:", error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
}
