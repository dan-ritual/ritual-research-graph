"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConfidenceBar } from "./confidence-bar";
import { EmailModal } from "./email-modal";

export interface Opportunity {
  id: string;
  slug: string;
  name: string;
  thesis?: string;
  angle?: string;
  confidence?: number;
  strategy?: string;
  email_draft?: { subject: string; body: string };
  stage_id: string;
  workflow_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  onAdvanceStage: (opportunityId: string) => void;
  isLastStage?: boolean;
}

export function OpportunityCard({
  opportunity,
  onAdvanceStage,
  isLastStage = false,
}: OpportunityCardProps) {
  const [generatingStrategy, setGeneratingStrategy] = useState(false);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailDraft, setEmailDraft] = useState<{ subject: string; body: string } | null>(
    opportunity.email_draft || null
  );

  const handleGenerateStrategy = async () => {
    setGeneratingStrategy(true);
    try {
      const res = await fetch(`/api/opportunities/${opportunity.id}/generate-strategy`, {
        method: "POST",
      });

      if (res.ok) {
        // Navigate to detail page to view strategy
        window.location.href = `/pipeline/${opportunity.id}`;
      } else {
        const data = await res.json();
        console.error("Failed to generate strategy:", data.error);
      }
    } catch (error) {
      console.error("Failed to generate strategy:", error);
    } finally {
      setGeneratingStrategy(false);
    }
  };

  const handleGenerateEmail = async () => {
    setGeneratingEmail(true);
    try {
      const res = await fetch(`/api/opportunities/${opportunity.id}/generate-email`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setEmailDraft(data.emailDraft);
        setShowEmailModal(true);
      } else {
        const errorData = await res.json();
        console.error("Failed to generate email:", errorData.error);
      }
    } catch (error) {
      console.error("Failed to generate email:", error);
    } finally {
      setGeneratingEmail(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-[rgba(0,0,0,0.08)] p-4 mb-3">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <Link
            href={`/pipeline/${opportunity.id}`}
            className="font-mono text-xs uppercase tracking-[0.12em] text-[#171717] hover:text-[#3B5FE6] transition-colors line-clamp-2"
          >
            {opportunity.name}
          </Link>
          {opportunity.confidence !== null && opportunity.confidence !== undefined && (
            <span className="font-mono text-[10px] text-[#3B5FE6] ml-2 shrink-0">
              {opportunity.confidence}%
            </span>
          )}
        </div>

        {/* Thesis */}
        {opportunity.thesis && (
          <p className="font-serif text-sm text-[rgba(0,0,0,0.65)] mb-3 line-clamp-2 italic">
            {opportunity.thesis}
          </p>
        )}

        {/* Confidence Bar */}
        <div className="mb-3">
          <ConfidenceBar value={opportunity.confidence ?? 0} />
        </div>

        {/* AI Actions */}
        <div className="flex gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateStrategy}
            disabled={generatingStrategy}
            className="text-[10px] h-6 px-2 flex-1"
          >
            {generatingStrategy ? "GENERATING..." : "STRATEGY"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateEmail}
            disabled={generatingEmail}
            className="text-[10px] h-6 px-2 flex-1"
          >
            {generatingEmail ? "GENERATING..." : "EMAIL"}
          </Button>
        </div>

        {/* Navigation Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-dotted border-[rgba(59,95,230,0.3)]">
          <Link href={`/pipeline/${opportunity.id}`}>
            <Button variant="ghost" size="sm" className="text-[10px] px-2 h-7">
              View
            </Button>
          </Link>
          {!isLastStage && (
            <Button
              onClick={() => onAdvanceStage(opportunity.id)}
              size="sm"
              className="text-[10px] px-3 h-7"
            >
              Next
            </Button>
          )}
        </div>
      </div>

      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        emailDraft={emailDraft}
      />
    </>
  );
}
