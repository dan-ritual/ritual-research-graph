"use client";

import { OpportunityCard, Opportunity } from "./opportunity-card";

export interface PipelineStage {
  id: string;
  slug: string;
  name: string;
  description?: string;
  position: number;
  workflow_id: string;
}

interface PipelineColumnProps {
  stage: PipelineStage;
  opportunities: Opportunity[];
  onAdvanceStage: (opportunityId: string) => void;
  isLastStage?: boolean;
}

export function PipelineColumn({
  stage,
  opportunities,
  onAdvanceStage,
  isLastStage = false,
}: PipelineColumnProps) {
  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] bg-[#FBFBFB]">
      {/* Column Header */}
      <div className="p-4 border-b border-[rgba(0,0,0,0.08)] bg-white">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-mono text-xs uppercase tracking-[0.12em] text-[#171717]">
            {stage.name}
          </h3>
          <span className="font-mono text-[10px] text-[rgba(0,0,0,0.45)]">
            {opportunities.length}
          </span>
        </div>
        {stage.description && (
          <p className="font-serif text-xs text-[rgba(0,0,0,0.45)] italic">
            {stage.description}
          </p>
        )}
      </div>

      {/* Cards Container */}
      <div className="flex-1 p-3 overflow-y-auto">
        {opportunities.length > 0 ? (
          opportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onAdvanceStage={onAdvanceStage}
              isLastStage={isLastStage}
            />
          ))
        ) : (
          <div className="p-4 text-center">
            <p className="font-mono text-[10px] text-[rgba(0,0,0,0.35)] uppercase tracking-[0.05em]">
              No opportunities
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
