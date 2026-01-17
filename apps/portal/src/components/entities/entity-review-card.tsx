"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, GitMerge, AlertTriangle } from "lucide-react";

interface PotentialDuplicate {
  entity_id: string;
  canonical_name: string;
  entity_type: string;
  similarity: number;
  match_type: string;
}

interface Entity {
  id: string;
  slug: string;
  canonical_name: string;
  type: string;
  metadata: Record<string, unknown> | null;
  review_status: string;
  potential_duplicates: PotentialDuplicate[];
  has_duplicates: boolean;
}

interface EntityReviewCardProps {
  entity: Entity;
  onApprove: () => void;
  onReject: () => void;
  onMerge: (duplicateId: string) => void;
  isProcessing: boolean;
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

function getStatusIcon(status: string) {
  switch (status) {
    case "approved":
      return <Check className="h-4 w-4 text-green-600" />;
    case "rejected":
      return <X className="h-4 w-4 text-red-600" />;
    case "merged":
      return <GitMerge className="h-4 w-4 text-purple-600" />;
    default:
      return <div className="h-4 w-4 rounded-full border-2 border-[rgba(0,0,0,0.2)]" />;
  }
}

export function EntityReviewCard({
  entity,
  onApprove,
  onReject,
  onMerge,
  isProcessing,
}: EntityReviewCardProps) {
  const isReviewed = entity.review_status !== "pending";
  const typeColor = getTypeColor(entity.type);

  return (
    <Card
      className={`border transition-all ${
        isReviewed
          ? "border-[rgba(0,0,0,0.08)] opacity-75"
          : entity.has_duplicates
          ? "border-amber-300 bg-amber-50/30"
          : "border-[rgba(0,0,0,0.08)]"
      }`}
    >
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          {/* Status indicator */}
          <div className="mt-1">{getStatusIcon(entity.review_status)}</div>

          {/* Entity info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-display text-sm font-semibold truncate">
                {entity.canonical_name}
              </h4>
              <Badge className={`${typeColor} font-mono text-[10px] uppercase`}>
                {entity.type}
              </Badge>
            </div>

            {entity.metadata?.description && typeof entity.metadata.description === "string" ? (
              <p className="font-serif text-xs text-[rgba(0,0,0,0.45)] italic line-clamp-1 mb-2">
                {entity.metadata.description}
              </p>
            ) : null}

            {/* Duplicate warning */}
            {entity.has_duplicates && entity.potential_duplicates.length > 0 && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-1 mb-2">
                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-amber-700">
                    Possible duplicate
                    {entity.potential_duplicates.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="space-y-1">
                  {entity.potential_duplicates.map((dup) => (
                    <div
                      key={dup.entity_id}
                      className="flex items-center justify-between"
                    >
                      <span className="font-mono text-xs text-[rgba(0,0,0,0.65)]">
                        {dup.canonical_name}
                        <span className="text-[rgba(0,0,0,0.35)] ml-1">
                          ({Math.round(dup.similarity * 100)}% match)
                        </span>
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMerge(dup.entity_id)}
                        disabled={isProcessing || isReviewed}
                        className="font-mono text-[10px] uppercase tracking-[0.05em] text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-6 px-2"
                      >
                        <GitMerge className="h-3 w-3 mr-1" />
                        Merge
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No duplicates - clean */}
            {!entity.has_duplicates && entity.review_status === "pending" && (
              <div className="flex items-center gap-1 text-green-600 mt-1">
                <Check className="h-3 w-3" />
                <span className="font-mono text-[10px] uppercase tracking-[0.05em]">
                  New entity (no duplicates)
                </span>
              </div>
            )}

            {/* Status message for reviewed */}
            {entity.review_status === "approved" && (
              <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-green-600 mt-1 block">
                Approved
              </span>
            )}
            {entity.review_status === "rejected" && (
              <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-red-600 mt-1 block">
                Rejected
              </span>
            )}
            {entity.review_status === "merged" && (
              <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-purple-600 mt-1 block">
                Merged
              </span>
            )}
          </div>

          {/* Actions */}
          {!isReviewed && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onReject}
                disabled={isProcessing}
                className="font-mono text-[10px] uppercase tracking-[0.05em] text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-3 w-3 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={onApprove}
                disabled={isProcessing}
                className="font-mono text-[10px] uppercase tracking-[0.05em] bg-green-600 hover:bg-green-700"
              >
                <Check className="h-3 w-3 mr-1" />
                Approve
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
