"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchWithMode } from "@/lib/fetch-with-mode";

interface Entity {
  id: string;
  name: string;
  type: string;
  slug: string;
}

interface EntityLinkerProps {
  opportunityId: string;
  onEntityLinked: () => void;
}

export function EntityLinker({ opportunityId, onEntityLinked }: EntityLinkerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Entity[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchEntities = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetchWithMode(`/api/entities/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.entities || []);
      setIsOpen(true);
    } catch (error) {
      console.error("Entity search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchEntities(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchEntities]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLinkEntity = async (entity: Entity, relationship: "primary" | "related") => {
    setLinking(entity.id);
    try {
      const res = await fetchWithMode(`/api/opportunities/${opportunityId}/entities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity_id: entity.id, relationship }),
      });

      if (res.ok) {
        setQuery("");
        setResults([]);
        setIsOpen(false);
        onEntityLinked();
      } else {
        const data = await res.json();
        console.error("Failed to link entity:", data.error);
      }
    } catch (error) {
      console.error("Failed to link entity:", error);
    } finally {
      setLinking(null);
    }
  };

  const getTypeColor = (type: string) => {
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
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search entities to link..."
          className="flex-1"
        />
        {loading && (
          <span className="font-mono text-[10px] uppercase text-[rgba(0,0,0,0.45)] self-center">
            Searching...
          </span>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-[rgba(0,0,0,0.08)] shadow-sm max-h-48 overflow-y-auto">
          {results.map((entity) => (
            <div
              key={entity.id}
              className="p-3 hover:bg-[#FBFBFB] border-b border-[rgba(0,0,0,0.05)] last:border-b-0"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">{entity.name}</span>
                  <span
                    className={`font-mono text-[10px] uppercase px-1.5 py-0.5 ${getTypeColor(
                      entity.type
                    )}`}
                  >
                    {entity.type}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[rgba(0,0,0,0.35)]">
                  {entity.slug}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLinkEntity(entity, "primary")}
                  disabled={linking === entity.id}
                  className="text-[10px] h-6 px-2"
                >
                  {linking === entity.id ? "..." : "PRIMARY"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLinkEntity(entity, "related")}
                  disabled={linking === entity.id}
                  className="text-[10px] h-6 px-2"
                >
                  {linking === entity.id ? "..." : "RELATED"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-[rgba(0,0,0,0.08)] p-3">
          <p className="font-mono text-[10px] text-[rgba(0,0,0,0.45)] uppercase">
            No entities found
          </p>
        </div>
      )}
    </div>
  );
}
