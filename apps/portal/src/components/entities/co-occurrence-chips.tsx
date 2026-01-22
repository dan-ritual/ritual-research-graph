import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface CoOccurrence {
  id: string;
  slug: string;
  canonical_name: string;
  type: string;
  co_occurrence_count: number;
}

interface CoOccurrenceChipsProps {
  coOccurrences: CoOccurrence[];
  /** Mode prefix for links (e.g., "/growth") */
  modePrefix?: string;
}

export function CoOccurrenceChips({ coOccurrences, modePrefix = "" }: CoOccurrenceChipsProps) {
  if (coOccurrences.length === 0) {
    return (
      <p className="font-serif text-sm italic text-[rgba(0,0,0,0.45)]">
        No co-occurring entities found.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {coOccurrences.map((entity) => (
        <Link key={entity.id} href={`${modePrefix}/entities/${entity.slug}`}>
          <Badge
            className="bg-[color-mix(in_srgb,var(--mode-accent)_10%,transparent)] text-[var(--mode-accent)] hover:bg-[color-mix(in_srgb,var(--mode-accent)_20%,transparent)] font-mono text-xs cursor-pointer transition-colors"
          >
            {entity.canonical_name}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
