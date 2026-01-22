"use client";

import { useState, useCallback } from "react";
import { ArtifactSection } from "./artifact-section";
import { SpotTreatmentModal } from "./spot-treatment-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, RefreshCw, Loader2 } from "lucide-react";
import { fetchWithMode } from "@/lib/fetch-with-mode";

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

interface Artifact {
  id: string;
  type: string;
  content: string;
  sections: Section[];
  last_edited_at?: string;
  original_content?: string;
}

interface ArtifactEditorProps {
  artifact: Artifact;
  jobId: string;
  onSave: (artifact: Artifact) => Promise<void>;
  onRegenerateMicrosite: () => Promise<void>;
}

function getTypeLabel(type: string): string {
  switch (type) {
    case "cleaned_transcript":
      return "Cleaned Transcript";
    case "intelligence_brief":
      return "Intelligence Brief";
    case "strategic_questions":
      return "Strategic Questions";
    case "site_config":
      return "Site Configuration";
    case "narrative_research":
      return "Narrative Research";
    case "entity_extraction":
      return "Entity Extraction";
    default:
      return type;
  }
}

export function ArtifactEditor({
  artifact,
  jobId,
  onSave,
  onRegenerateMicrosite,
}: ArtifactEditorProps) {
  const [sections, setSections] = useState<Section[]>(artifact.sections || []);
  const [frozenSections, setFrozenSections] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Modal state
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasUnsavedChanges = sections.some(
    (s, i) => s.content !== artifact.sections[i]?.content
  );

  const editedCount = sections.filter((s) => s.editedAt).length;

  const toggleFreeze = useCallback((sectionId: string) => {
    setFrozenSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const handleEditSection = useCallback(
    (sectionId: string, newContent: string) => {
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                content: newContent,
                editedAt: new Date().toISOString(),
                originalContent: s.originalContent || s.content,
              }
            : s
        )
      );
    },
    []
  );

  const handleOpenRegenModal = useCallback((section: Section) => {
    setSelectedSection(section);
    setIsModalOpen(true);
  }, []);

  const getFrozenContext = useCallback(
    (sectionId: string) => {
      const targetIndex = sections.findIndex((s) => s.id === sectionId);

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
    },
    [sections]
  );

  const handleRegenerate = useCallback(
    async (instructions: string) => {
      if (!selectedSection) return;

      const response = await fetchWithMode(
        `/api/jobs/${jobId}/artifacts/${artifact.id}/regenerate-section`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sectionId: selectedSection.id,
            instructions,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to regenerate section");
      }

      const data = await response.json();

      // Update local sections with regenerated content
      if (data.artifact?.sections) {
        setSections(data.artifact.sections);
      }
    },
    [selectedSection, jobId, artifact.id]
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        ...artifact,
        sections,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateMicrosite = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerateMicrosite();
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Card className="border-[rgba(0,0,0,0.08)]">
      <CardHeader className="border-b border-dotted border-[color-mix(in_srgb,var(--mode-accent)_30%,transparent)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="font-mono text-sm uppercase tracking-[0.08em] text-[rgba(0,0,0,0.65)]">
              {getTypeLabel(artifact.type)}
            </CardTitle>
            {editedCount > 0 && (
              <Badge
                variant="outline"
                className="font-mono text-[10px] uppercase tracking-[0.05em] text-[var(--mode-accent)] border-[var(--mode-accent)]/30"
              >
                {editedCount} section{editedCount !== 1 ? "s" : ""} edited
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateMicrosite}
              disabled={isRegenerating || !editedCount}
              className="font-mono text-xs uppercase tracking-[0.05em]"
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Rebuild Site
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="font-mono text-xs uppercase tracking-[0.05em] bg-[var(--mode-accent)] hover:bg-[var(--mode-accent)]/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-dotted divide-[rgba(0,0,0,0.08)]">
          {sections.map((section) => (
            <ArtifactSection
              key={section.id}
              section={section}
              isFrozen={frozenSections.has(section.id)}
              onToggleFreeze={() => toggleFreeze(section.id)}
              onEdit={(content) => handleEditSection(section.id, content)}
              onRegenerate={() => handleOpenRegenModal(section)}
            />
          ))}
        </div>
      </CardContent>

      {/* Spot Treatment Modal */}
      <SpotTreatmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSection(null);
        }}
        section={selectedSection}
        frozenBefore={
          selectedSection ? getFrozenContext(selectedSection.id).before : ""
        }
        frozenAfter={
          selectedSection ? getFrozenContext(selectedSection.id).after : ""
        }
        onRegenerate={handleRegenerate}
      />
    </Card>
  );
}
