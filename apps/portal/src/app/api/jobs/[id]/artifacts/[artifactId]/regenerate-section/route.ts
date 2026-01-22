import { resolveMode } from "@/lib/db.server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

interface Section {
  id: string;
  header: string;
  level: number;
  content: string;
  startLine: number;
  endLine: number;
  editedAt?: string;
  originalContent?: string;
}

const anthropic = new Anthropic();

// Generate frozen context summary
function getFrozenContext(
  sections: Section[],
  targetSectionId: string
): { before: string; after: string } {
  const targetIndex = sections.findIndex((s) => s.id === targetSectionId);

  if (targetIndex === -1) {
    return { before: "", after: "" };
  }

  const beforeSections = sections.slice(0, targetIndex);
  const before = beforeSections
    .map((s) => {
      const preview =
        s.content.length > 300
          ? s.content.substring(0, 300) + "..."
          : s.content;
      return s.header ? `${s.header}\n${preview}` : preview;
    })
    .join("\n\n");

  const afterSections = sections.slice(targetIndex + 1);
  const after = afterSections
    .map((s) => {
      const preview =
        s.content.length > 300
          ? s.content.substring(0, 300) + "..."
          : s.content;
      return s.header ? `${s.header}\n${preview}` : preview;
    })
    .join("\n\n");

  return { before, after };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; artifactId: string }> }
) {
  const { id: jobId, artifactId } = await params;
  // Middleware handles auth - use service client for fast DB access
  const supabase = createServiceClient();

  // Resolve mode from header or cookie
  const mode = await resolveMode();

  const body = await request.json();
  const { sectionId, instructions } = body;

  if (!sectionId) {
    return NextResponse.json(
      { error: "sectionId is required" },
      { status: 400 }
    );
  }

  if (!instructions || instructions.trim().length === 0) {
    return NextResponse.json(
      { error: "instructions are required" },
      { status: 400 }
    );
  }

  // Fetch artifact
  const { data: artifact, error } = await supabase
    .schema(mode)
    .from("artifacts")
    .select("*")
    .eq("id", artifactId)
    .eq("job_id", jobId)
    .single();

  if (error || !artifact) {
    return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
  }

  // Get sections (from stored or parse fresh)
  const sections: Section[] = artifact.sections || [];
  if (sections.length === 0) {
    return NextResponse.json(
      { error: "Artifact has no sections to regenerate" },
      { status: 400 }
    );
  }

  // Find target section
  const targetSection = sections.find((s) => s.id === sectionId);
  if (!targetSection) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  // Get frozen context
  const { before, after } = getFrozenContext(sections, sectionId);

  // Build Claude prompt
  const prompt = `You are editing a specific section of a research document.

CONTEXT (frozen, for reference only):
---
${before || "(This is the first section)"}
---

SECTION TO REGENERATE:
Current header: ${targetSection.header}
Current content:
---
${targetSection.content}
---

User instructions: ${instructions}

CONTEXT (frozen, for reference only):
---
${after || "(This is the last section)"}
---

Requirements:
- Generate ONLY the replacement content for the target section
- Do NOT include the section header (${targetSection.header}) - just the body content
- Maintain consistent tone and formatting with surrounding content
- Keep similar length unless instructions specify otherwise
- Follow the user's instructions precisely

Output the new section content:`;

  try {
    // Call Claude for regeneration
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract generated content
    const generatedContent =
      response.content[0].type === "text"
        ? response.content[0].text.trim()
        : "";

    if (!generatedContent) {
      return NextResponse.json(
        { error: "Failed to generate content" },
        { status: 500 }
      );
    }

    // Update the section in place
    const updatedSections = sections.map((s) => {
      if (s.id === sectionId) {
        return {
          ...s,
          content: generatedContent,
          editedAt: new Date().toISOString(),
          originalContent: s.originalContent || s.content,
        };
      }
      return s;
    });

    // Reassemble full content
    const assembledContent = updatedSections
      .map((s) => (s.header ? `${s.header}\n\n${s.content}` : s.content))
      .join("\n\n");

    // Store original content on first edit
    const originalContent = artifact.original_content || artifact.content;

    // Update artifact in database
    const { data: updated, error: updateError } = await supabase
      .schema(mode)
      .from("artifacts")
      .update({
        content: assembledContent,
        sections: updatedSections,
        original_content: originalContent,
        last_edited_at: new Date().toISOString(),
      })
      .eq("id", artifactId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to save regenerated content" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      artifact: updated,
      regeneratedSection: {
        id: sectionId,
        newContent: generatedContent,
      },
    });
  } catch (claudeError) {
    console.error("Claude API error:", claudeError);
    return NextResponse.json(
      { error: "Failed to regenerate section" },
      { status: 500 }
    );
  }
}
