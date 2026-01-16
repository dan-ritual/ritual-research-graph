"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

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
}

export function LinkedEntityList({
  opportunityId,
  entities,
  onEntityRemoved,
}: LinkedEntityListProps) {
  const [removing, setRemoving] = useState<string | null>(null);

  const handleRemove = async (entityId: string) => {
    setRemoving(entityId);
    try {
      const res = await fetch(
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "company":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "person":
        return "bg-green-100 text-green-800 border-green-200";
      case "protocol":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "concept":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRelationshipBadge = (relationship: string) => {
    switch (relationship) {
      case "primary":
        return "bg-[#3B5FE6] text-white";
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
          className={`flex items-center gap-1.5 px-2 py-1 border ${getTypeColor(
            entity.type
          )}`}
        >
          <span className="font-mono text-xs">{entity.name}</span>
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
