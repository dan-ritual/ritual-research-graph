"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, GitMerge, Loader2 } from "lucide-react";

interface Entity {
  id: string;
  canonical_name: string;
  type: string;
  appearance_count?: number;
}

interface EntityMergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceEntity: Entity | null;
  targetEntity: Entity | null;
  onConfirmMerge: (newCanonicalName: string) => Promise<void>;
}

function getTypeColor(type: string): string {
  switch (type) {
    case "company":
      return "bg-blue-100 text-blue-800";
    case "person":
      return "bg-green-100 text-green-800";
    case "protocol":
      return "bg-purple-100 text-purple-800";
    case "concept":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function EntityMergeModal({
  isOpen,
  onClose,
  sourceEntity,
  targetEntity,
  onConfirmMerge,
}: EntityMergeModalProps) {
  const [canonicalName, setCanonicalName] = useState(
    targetEntity?.canonical_name || sourceEntity?.canonical_name || ""
  );
  const [isMerging, setIsMerging] = useState(false);

  // Reset canonical name when entities change
  useEffect(() => {
    setCanonicalName(
      targetEntity?.canonical_name || sourceEntity?.canonical_name || ""
    );
  }, [targetEntity?.canonical_name, sourceEntity?.canonical_name]);

  const handleMerge = async () => {
    if (!canonicalName.trim()) return;

    setIsMerging(true);
    try {
      await onConfirmMerge(canonicalName);
      onClose();
    } catch (error) {
      console.error("Merge failed:", error);
    } finally {
      setIsMerging(false);
    }
  };

  if (!sourceEntity || !targetEntity) return null;

  const sourceColor = getTypeColor(sourceEntity.type);
  const targetColor = getTypeColor(targetEntity.type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white border-none shadow-xl">
        <DialogHeader className="border-b border-dotted border-[rgba(59,95,230,0.3)] pb-4">
          <DialogTitle className="font-mono text-sm uppercase tracking-[0.12em] text-[#3B5FE6]">
            Merge Entities
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Entity comparison */}
          <div className="flex items-center gap-4">
            {/* Source (extracted) */}
            <div className="flex-1 border border-[rgba(0,0,0,0.08)] p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.05em] text-[rgba(0,0,0,0.35)] mb-2">
                Extracted
              </div>
              <div className="font-display text-sm font-semibold">
                {sourceEntity.canonical_name}
              </div>
              <Badge className={`${sourceColor} font-mono text-[10px] mt-2`}>
                {sourceEntity.type}
              </Badge>
              <div className="font-mono text-[10px] text-[rgba(0,0,0,0.45)] mt-2">
                {sourceEntity.appearance_count || 0} appearances
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight className="h-5 w-5 text-[rgba(0,0,0,0.25)] flex-shrink-0" />

            {/* Target (existing) */}
            <div className="flex-1 border border-[#3B5FE6]/30 bg-[#3B5FE6]/5 p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.05em] text-[#3B5FE6] mb-2">
                Existing
              </div>
              <div className="font-display text-sm font-semibold">
                {targetEntity.canonical_name}
              </div>
              <Badge className={`${targetColor} font-mono text-[10px] mt-2`}>
                {targetEntity.type}
              </Badge>
              <div className="font-mono text-[10px] text-[rgba(0,0,0,0.45)] mt-2">
                {targetEntity.appearance_count || 0} appearances
              </div>
            </div>
          </div>

          {/* Merged result */}
          <div className="border border-dotted border-[rgba(59,95,230,0.3)] p-4 bg-[#FAFAFA]">
            <div className="font-mono text-[10px] uppercase tracking-[0.05em] text-[rgba(0,0,0,0.45)] mb-3">
              Merged Result
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.05em] text-[rgba(0,0,0,0.45)] block mb-1">
                  Canonical Name
                </label>
                <Input
                  value={canonicalName}
                  onChange={(e) => setCanonicalName(e.target.value)}
                  className="font-display text-sm border-[rgba(0,0,0,0.12)] focus:border-[#3B5FE6] focus:ring-[#3B5FE6]/20"
                />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-[rgba(0,0,0,0.45)]">
                  Aliases:
                </span>
                <span className="font-mono text-xs text-[rgba(0,0,0,0.65)] ml-2">
                  {sourceEntity.canonical_name}
                  {sourceEntity.canonical_name !== targetEntity.canonical_name &&
                    `, ${targetEntity.canonical_name}`}
                </span>
              </div>
            </div>
          </div>

          {/* Info */}
          <p className="font-serif text-xs text-[rgba(0,0,0,0.45)] italic">
            The extracted entity will be merged into the existing one. All
            appearances will be transferred and the extracted name will become
            an alias.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dotted border-[rgba(0,0,0,0.08)]">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isMerging}
              className="font-mono text-xs uppercase tracking-[0.05em]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleMerge}
              disabled={!canonicalName.trim() || isMerging}
              className="font-mono text-xs uppercase tracking-[0.05em] bg-purple-600 hover:bg-purple-700"
            >
              {isMerging ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Merging...
                </>
              ) : (
                <>
                  <GitMerge className="h-3 w-3 mr-2" />
                  Confirm Merge
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
