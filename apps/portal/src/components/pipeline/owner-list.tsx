"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchWithMode } from "@/lib/fetch-with-mode";

interface Owner {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  assigned_at: string;
}

interface OwnerListProps {
  opportunityId: string;
  owners: Owner[];
  onOwnerRemoved: () => void;
}

export function OwnerList({ opportunityId, owners, onOwnerRemoved }: OwnerListProps) {
  const [removing, setRemoving] = useState<string | null>(null);

  const handleRemove = async (userId: string) => {
    setRemoving(userId);
    try {
      const res = await fetchWithMode(
        `/api/opportunities/${opportunityId}/owners/${userId}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        onOwnerRemoved();
      } else {
        const data = await res.json();
        console.error("Failed to remove owner:", data.error);
      }
    } catch (error) {
      console.error("Failed to remove owner:", error);
    } finally {
      setRemoving(null);
    }
  };

  if (owners.length === 0) {
    return (
      <p className="font-mono text-[10px] text-[rgba(0,0,0,0.35)] uppercase">
        No owners assigned
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {owners.map((owner) => (
        <div
          key={owner.id}
          className="flex items-center gap-2 px-2 py-1 bg-[#F5F5F5] border border-[rgba(0,0,0,0.08)]"
        >
          <div className="h-5 w-5 bg-white flex items-center justify-center font-mono text-[10px] font-medium flex-shrink-0">
            {owner.avatar_url ? (
              <img
                src={owner.avatar_url}
                alt={owner.name || owner.email}
                className="h-5 w-5 object-cover"
              />
            ) : (
              (owner.name || owner.email).charAt(0).toUpperCase()
            )}
          </div>
          <span className="font-mono text-xs">
            {owner.name || owner.email.split("@")[0]}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemove(owner.id)}
            disabled={removing === owner.id}
            className="h-4 w-4 p-0 hover:bg-red-100"
          >
            {removing === owner.id ? (
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
