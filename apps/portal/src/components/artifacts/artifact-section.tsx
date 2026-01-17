"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Lock, Edit2, RefreshCw, Check, X } from "lucide-react";

interface Section {
  id: string;
  header: string;
  level: number;
  content: string;
  editedAt?: string;
  originalContent?: string;
}

interface ArtifactSectionProps {
  section: Section;
  isFrozen: boolean;
  onToggleFreeze: () => void;
  onEdit: (content: string) => void;
  onRegenerate: () => void;
}

export function ArtifactSection({
  section,
  isFrozen,
  onToggleFreeze,
  onEdit,
  onRegenerate,
}: ArtifactSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(section.content);

  const handleSave = () => {
    onEdit(editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(section.content);
    setIsEditing(false);
  };

  const hasBeenEdited = !!section.editedAt;

  return (
    <div
      className={`border transition-colors ${
        isFrozen
          ? "border-[rgba(0,0,0,0.08)] bg-[#FAFAFA]"
          : "border-[#3B5FE6]/30 bg-white"
      }`}
    >
      {/* Section header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-dotted border-[rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2">
          {section.header ? (
            <h3 className="font-mono text-sm font-semibold">
              {section.header.replace(/^#+\s*/, "")}
            </h3>
          ) : (
            <span className="font-mono text-sm text-[rgba(0,0,0,0.45)]">
              Introduction
            </span>
          )}
          {hasBeenEdited && (
            <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-[#3B5FE6] bg-[#3B5FE6]/10 px-1.5 py-0.5">
              Edited
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isFrozen ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFreeze}
              className="font-mono text-[10px] uppercase tracking-[0.05em] text-[rgba(0,0,0,0.45)] hover:text-[#3B5FE6]"
            >
              <Lock className="h-3 w-3 mr-1" />
              Frozen
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleFreeze}
                className="font-mono text-[10px] uppercase tracking-[0.05em] text-[rgba(0,0,0,0.45)] hover:text-[#3B5FE6]"
              >
                <Lock className="h-3 w-3 mr-1" />
                Freeze
              </Button>
              {!isEditing && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="font-mono text-[10px] uppercase tracking-[0.05em] text-[rgba(0,0,0,0.45)] hover:text-[#3B5FE6]"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRegenerate}
                    className="font-mono text-[10px] uppercase tracking-[0.05em] text-[#3B5FE6] hover:bg-[#3B5FE6]/10"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Regen
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Section content */}
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[200px] font-serif text-sm leading-relaxed border-[#3B5FE6]/30 focus:border-[#3B5FE6] focus:ring-[#3B5FE6]/20"
            />
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="font-mono text-xs uppercase tracking-[0.05em]"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="font-mono text-xs uppercase tracking-[0.05em] bg-[#3B5FE6] hover:bg-[#3B5FE6]/90"
              >
                <Check className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={`font-serif text-sm leading-relaxed whitespace-pre-wrap ${
              isFrozen ? "text-[rgba(0,0,0,0.45)] italic" : "text-[#171717]"
            }`}
          >
            {section.content}
          </div>
        )}
      </div>
    </div>
  );
}
