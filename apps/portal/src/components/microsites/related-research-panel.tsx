"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchWithMode } from "@/lib/fetch-with-mode";

interface RelatedMicrosite {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  created_at: string;
  shared_entity_count: number;
}

interface RelatedResearchPanelProps {
  micrositeSlug: string;
  /** Mode prefix for links (e.g., "/growth") */
  modePrefix?: string;
}

export function RelatedResearchPanel({ micrositeSlug, modePrefix = "" }: RelatedResearchPanelProps) {
  const [related, setRelated] = useState<RelatedMicrosite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const response = await fetchWithMode(`/api/microsites/${micrositeSlug}/related`);
        if (response.ok) {
          const data = await response.json();
          setRelated(data.related || []);
        }
      } catch (error) {
        console.error("Failed to fetch related research:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [micrositeSlug]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.65)]">
            Related Research
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-xs text-[rgba(0,0,0,0.35)] uppercase tracking-[0.05em]">
            Loading...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (related.length === 0) {
    return null; // Don't show if no related research
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.65)]">
          Related Research
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {related.map((microsite) => (
            <Link
              key={microsite.id}
              href={`${modePrefix}/microsites/${microsite.slug}`}
              className="block p-3 -mx-3 hover:bg-[rgba(0,0,0,0.02)] transition-colors border-b border-dotted border-[rgba(0,0,0,0.06)] last:border-0"
            >
              <div className="font-display text-sm font-medium">
                {microsite.title}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.05em] text-[rgba(0,0,0,0.45)] mt-1">
                {microsite.shared_entity_count} shared{" "}
                {microsite.shared_entity_count === 1 ? "entity" : "entities"}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
