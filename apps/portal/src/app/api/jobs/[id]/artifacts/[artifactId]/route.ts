import { getSchemaTable } from "@/lib/db";
import { resolveMode } from "@/lib/db.server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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

// Parse markdown into sections
function parseMarkdownSections(markdown: string): Section[] {
  const lines = markdown.split("\n");
  const sections: Section[] = [];
  const headerRegex = /^(#{2,3})\s+(.+)$/;

  let currentSection: Section | null = null;
  let contentLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(headerRegex);

    if (match) {
      if (currentSection) {
        currentSection.content = contentLines.join("\n").trim();
        currentSection.endLine = i - 1;
        sections.push(currentSection);
      }

      const level = match[1].length;
      const headerText = match[2];

      currentSection = {
        id: headerText
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")
          .substring(0, 50),
        header: line,
        level,
        content: "",
        startLine: i,
        endLine: i,
      };
      contentLines = [];
    } else if (currentSection) {
      contentLines.push(line);
    } else if (line.trim()) {
      currentSection = {
        id: "intro",
        header: "",
        level: 0,
        content: "",
        startLine: 0,
        endLine: 0,
      };
      contentLines = [line];
    }
  }

  if (currentSection) {
    currentSection.content = contentLines.join("\n").trim();
    currentSection.endLine = lines.length - 1;
    sections.push(currentSection);
  }

  return sections;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; artifactId: string }> }
) {
  const { id: jobId, artifactId } = await params;
  // Middleware handles auth - use service client for fast DB access
  const supabase = createServiceClient();

  // Resolve mode from query param, header, or cookie
  const modeParam = request.nextUrl.searchParams.get("mode") || undefined;
  const mode = await resolveMode(modeParam);

  // Fetch artifact
  const { data: artifact, error } = await supabase
    .from(getSchemaTable("artifacts", mode))
    .select("*")
    .eq("id", artifactId)
    .eq("job_id", jobId)
    .single();

  if (error || !artifact) {
    return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
  }

  // Parse sections if content exists but sections not stored
  let sections = artifact.sections || [];
  if (artifact.content && (!sections || sections.length === 0)) {
    sections = parseMarkdownSections(artifact.content);
  }

  return NextResponse.json({
    artifact: {
      ...artifact,
      sections,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; artifactId: string }> }
) {
  const { id: jobId, artifactId } = await params;
  // Middleware handles auth - use service client for fast DB access
  const supabase = createServiceClient();

  // Resolve mode from header or cookie
  const mode = await resolveMode();

  const body = await request.json();
  const { content, sections } = body;

  // Validate at least one update field
  if (!content && !sections) {
    return NextResponse.json(
      { error: "Must provide content or sections to update" },
      { status: 400 }
    );
  }

  // Get current artifact for original_content tracking
  const { data: current } = await supabase
    .from(getSchemaTable("artifacts", mode))
    .select("content, original_content")
    .eq("id", artifactId)
    .eq("job_id", jobId)
    .single();

  if (!current) {
    return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
  }

  // Prepare update
  const update: Record<string, unknown> = {
    last_edited_at: new Date().toISOString(),
  };

  // Store original content on first edit
  if (!current.original_content) {
    update.original_content = current.content;
  }

  if (content) {
    update.content = content;
    // Re-parse sections when content changes
    update.sections = parseMarkdownSections(content);
  }

  if (sections) {
    update.sections = sections;
    // Reassemble content from sections
    const assembledContent = sections
      .map((s: Section) => (s.header ? `${s.header}\n\n${s.content}` : s.content))
      .join("\n\n");
    update.content = assembledContent;
  }

  // Update artifact
  const { data: updated, error: updateError } = await supabase
    .from(getSchemaTable("artifacts", mode))
    .update(update)
    .eq("id", artifactId)
    .eq("job_id", jobId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update artifact" },
      { status: 500 }
    );
  }

  return NextResponse.json({ artifact: updated });
}
