"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchWithMode } from "@/lib/fetch-with-mode";

interface LinkedEntity {
  id: string;
  name: string;
  type: string;
  slug: string;
  relationship: "primary" | "related" | "competitor";
}

interface LinkedEntityListProps {
  opportunityId: string;
  entities: LinkedEntity[];
  onEntityRemoved: () => void;
  /** Mode prefix for links (e.g., "/growth") */
  modePrefix?: string;
}

export function LinkedEntityList({
  opportunityId,
  entities,
  onEntityRemoved,
  modePrefix = "",
}: LinkedEntityListProps) {
  const [removing, setRemoving] = useState<string | null>(null);

  const handleRemove = async (entityId: string) => {
    setRemoving(entityId);
    try {
      const res = await fetchWithMode(
        `/api/opportunities/${opportunityId}/entities/${entityId}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        onEntityRemoved();
      } else {
        const data = await res.json();
        console.error("Failed to remove entity:", data.error);
      }
    } catch (error) {
      console.error("Failed to remove entity:", error);
    } finally {
      setRemoving(null);
    }
  };

  const badgeClass =
    "bg-[color-mix(in_srgb,var(--mode-accent)_10%,transparent)] text-[var(--mode-accent)] border-[color-mix(in_srgb,var(--mode-accent)_30%,transparent)]";

  const getRelationshipBadge = (relationship: string) => {
    switch (relationship) {
      case "primary":
        return "bg-[var(--mode-accent)] text-white";
      case "competitor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (entities.length === 0) {
    return (
      <p className="font-mono text-[10px] text-[rgba(0,0,0,0.35)] uppercase">
        No entities linked
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {entities.map((entity) => (
        <div
          key={entity.id}
          className={`flex items-center gap-1.5 px-2 py-1 border ${badgeClass}`}
        >
          <Link
            href={`${modePrefix}/entities/${entity.slug}`}
            className="font-mono text-xs hover:underline"
          >
            {entity.name}
          </Link>
          <span
            className={`font-mono text-[8px] uppercase px-1 py-0.5 ${getRelationshipBadge(
              entity.relationship
            )}`}
          >
            {entity.relationship}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemove(entity.id)}
            disabled={removing === entity.id}
            className="h-4 w-4 p-0 ml-1 hover:bg-red-100"
          >
            {removing === entity.id ? (
              <span className="text-[8px]">...</span>
            ) : (
              <span className="text-xs leading-none">×</span>
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}
