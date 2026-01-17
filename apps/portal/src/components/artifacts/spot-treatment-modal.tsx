"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDown, ChevronUp, RefreshCw, Loader2 } from "lucide-react";

interface Section {
  id: string;
  header: string;
  level: number;
  content: string;
}

interface SpotTreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: Section | null;
  frozenBefore: string;
  frozenAfter: string;
  onRegenerate: (instructions: string) => Promise<void>;
}

export function SpotTreatmentModal({
  isOpen,
  onClose,
  section,
  frozenBefore,
  frozenAfter,
  onRegenerate,
}: SpotTreatmentModalProps) {
  const [instructions, setInstructions] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    if (!instructions.trim()) return;

    setIsRegenerating(true);
    try {
      await onRegenerate(instructions);
      setInstructions("");
      onClose();
    } catch (error) {
      console.error("Regeneration failed:", error);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!section) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white border-none shadow-xl">
        <DialogHeader className="border-b border-dotted border-[rgba(59,95,230,0.3)] pb-4">
          <DialogTitle className="font-mono text-sm uppercase tracking-[0.12em] text-[#3B5FE6]">
            Regenerate Section
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Current content preview */}
          <div>
            <label className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)] block mb-2">
              Current Content
            </label>
            <div className="border border-[rgba(0,0,0,0.08)] bg-[#FAFAFA] p-4 max-h-[150px] overflow-y-auto">
              <div className="font-mono text-xs text-[rgba(0,0,0,0.45)] mb-2">
                {section.header || "Introduction"}
              </div>
              <p className="font-serif text-sm text-[rgba(0,0,0,0.65)] line-clamp-4">
                {section.content.substring(0, 400)}
                {section.content.length > 400 && "..."}
              </p>
            </div>
          </div>

          {/* Edit instructions */}
          <div>
            <label className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)] block mb-2">
              Edit Instructions
            </label>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Describe how you want this section changed..."
              className="min-h-[100px] font-serif text-sm border-[rgba(0,0,0,0.12)] focus:border-[#3B5FE6] focus:ring-[#3B5FE6]/20"
            />
            <p className="font-mono text-[10px] text-[rgba(0,0,0,0.35)] mt-1">
              Example: &quot;Focus more on the technical implementation details&quot; or
              &quot;Make this section more concise&quot;
            </p>
          </div>

          {/* Frozen context toggle */}
          <div>
            <button
              onClick={() => setShowContext(!showContext)}
              className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)] hover:text-[#3B5FE6] transition-colors"
            >
              {showContext ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              {showContext ? "Hide" : "Show"} frozen context
            </button>

            {showContext && (
              <div className="mt-3 space-y-3">
                {frozenBefore && (
                  <div className="border border-[rgba(0,0,0,0.08)] bg-[#FAFAFA] p-3">
                    <div className="font-mono text-[10px] uppercase tracking-[0.05em] text-[rgba(0,0,0,0.35)] mb-2">
                      Content Before (Frozen)
                    </div>
                    <p className="font-serif text-xs text-[rgba(0,0,0,0.45)] italic line-clamp-3">
                      {frozenBefore.substring(0, 300)}...
                    </p>
                  </div>
                )}
                {frozenAfter && (
                  <div className="border border-[rgba(0,0,0,0.08)] bg-[#FAFAFA] p-3">
                    <div className="font-mono text-[10px] uppercase tracking-[0.05em] text-[rgba(0,0,0,0.35)] mb-2">
                      Content After (Frozen)
                    </div>
                    <p className="font-serif text-xs text-[rgba(0,0,0,0.45)] italic line-clamp-3">
                      {frozenAfter.substring(0, 300)}...
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dotted border-[rgba(0,0,0,0.08)]">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isRegenerating}
              className="font-mono text-xs uppercase tracking-[0.05em]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRegenerate}
              disabled={!instructions.trim() || isRegenerating}
              className="font-mono text-xs uppercase tracking-[0.05em] bg-[#3B5FE6] hover:bg-[#3B5FE6]/90"
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Regenerate Section
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
