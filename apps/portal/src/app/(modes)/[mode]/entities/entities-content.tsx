"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { EntityCard } from "@/components/entities/entity-card";
import { EntityTypeFilter } from "@/components/entities/entity-type-filter";
import { EntitySearchInput } from "@/components/entities/entity-search-input";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import type { ModeId } from "@ritual-research/core";
import { fetchWithMode } from "@/lib/fetch-with-mode";

interface Entity {
  id: string;
  slug: string;
  canonical_name: string;
  type: string;
  metadata: {
    description?: string;
    url?: string;
    twitter?: string;
  } | null;
  appearance_count: number | null;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface EntitiesContentProps {
  mode: ModeId;
}

export function EntitiesContent({ mode }: EntitiesContentProps) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("appearance_count");

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchEntities = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        sort: sortBy,
        mode: mode,
      });

      if (searchQuery.length >= 2) {
        params.set("q", searchQuery);
      }

      if (typeFilter !== "all") {
        params.set("type", typeFilter);
      }

      const response = await fetchWithMode(`/api/entities?${params}`);
      const data = await response.json();

      if (response.ok) {
        setEntities(data.entities);
        setPagination(data.pagination);
      } else {
        setError(data.error || "Failed to fetch entities");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, typeFilter, sortBy, mode]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchEntities(1);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, typeFilter, sortBy, fetchEntities]);

  const handlePageChange = (newPage: number) => {
    fetchEntities(newPage);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-mono text-sm font-semibold uppercase tracking-[0.12em] text-[var(--mode-accent)] pb-4 mb-6 border-b border-dotted border-[color-mix(in_srgb,var(--mode-accent)_30%,transparent)]">
          Entities
        </h1>
        <p className="font-serif text-sm italic text-[rgba(0,0,0,0.45)]">
          Browse and explore all entities in the knowledge graph.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <EntitySearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name..."
          />
        </div>
        <EntityTypeFilter value={typeFilter} onChange={setTypeFilter} mode={mode} />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-[rgba(0,0,0,0.12)] bg-white font-mono text-xs uppercase tracking-[0.05em] focus:outline-none focus:ring-2 focus:ring-[var(--mode-accent)]/20"
        >
          <option value="appearance_count">Most Appearances</option>
          <option value="name">Name A-Z</option>
          <option value="updated">Recently Updated</option>
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loading />
        </div>
      ) : error ? (
        <ErrorState
          title="Failed to load entities"
          message={error}
          onRetry={() => fetchEntities(pagination.page)}
        />
      ) : entities.length === 0 ? (
        <EmptyState
          title="No entities found"
          message={searchQuery || typeFilter !== "all"
            ? "No entities match your search criteria. Try adjusting your filters."
            : "No entities in the knowledge graph yet. Generate a microsite to extract entities."
          }
          actionLabel={!searchQuery && typeFilter === "all" ? "+ New Research" : undefined}
          actionHref={!searchQuery && typeFilter === "all" ? `/${mode}/new` : undefined}
        />
      ) : (
        <>
          {/* Count */}
          <div className="font-mono text-xs text-[rgba(0,0,0,0.45)] uppercase tracking-[0.05em]">
            {pagination.total} entities found
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entities.map((entity) => (
              <EntityCard key={entity.id} entity={entity} modePrefix={`/${mode}`} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="font-mono text-xs uppercase tracking-[0.05em]"
              >
                Previous
              </Button>
              <span className="font-mono text-xs text-[rgba(0,0,0,0.45)]">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="font-mono text-xs uppercase tracking-[0.05em]"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
