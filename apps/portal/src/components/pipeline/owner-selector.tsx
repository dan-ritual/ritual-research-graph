"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
}

interface OwnerSelectorProps {
  opportunityId: string;
  currentOwnerIds: string[];
  onOwnerAdded: () => void;
}

export function OwnerSelector({
  opportunityId,
  currentOwnerIds,
  onOwnerAdded,
}: OwnerSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    }

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddOwner = async (userId: string) => {
    setAdding(userId);
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/owners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (res.ok) {
        onOwnerAdded();
      } else {
        const data = await res.json();
        console.error("Failed to add owner:", data.error);
      }
    } catch (error) {
      console.error("Failed to add owner:", error);
    } finally {
      setAdding(null);
    }
  };

  const availableUsers = users.filter((u) => !currentOwnerIds.includes(u.id));

  return (
    <div ref={containerRef} className="relative inline-block">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-[10px] h-7 px-2"
      >
        + Add Owner
      </Button>

      {isOpen && (
        <div className="absolute z-10 mt-1 right-0 bg-white border border-[rgba(0,0,0,0.08)] shadow-sm min-w-48 max-h-48 overflow-y-auto">
          {loading ? (
            <div className="p-3">
              <span className="font-mono text-[10px] uppercase text-[rgba(0,0,0,0.45)]">
                Loading...
              </span>
            </div>
          ) : availableUsers.length === 0 ? (
            <div className="p-3">
              <span className="font-mono text-[10px] uppercase text-[rgba(0,0,0,0.45)]">
                All users assigned
              </span>
            </div>
          ) : (
            availableUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleAddOwner(user.id)}
                disabled={adding === user.id}
                className="w-full p-3 hover:bg-[#FBFBFB] border-b border-[rgba(0,0,0,0.05)] last:border-b-0 flex items-center gap-3 text-left disabled:opacity-50"
              >
                <div className="h-6 w-6 bg-[#F5F5F5] flex items-center justify-center font-mono text-[10px] font-medium flex-shrink-0">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name || user.email}
                      className="h-6 w-6 object-cover"
                    />
                  ) : (
                    (user.name || user.email).charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-xs truncate">
                    {user.name || user.email}
                  </p>
                  {user.name && (
                    <p className="font-mono text-[10px] text-[rgba(0,0,0,0.45)] truncate">
                      {user.email}
                    </p>
                  )}
                </div>
                {adding === user.id && (
                  <span className="font-mono text-[10px] text-[rgba(0,0,0,0.45)] ml-auto">
                    ...
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
