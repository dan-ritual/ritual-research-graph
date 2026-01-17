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
}

function getTypeColor(type: string): string {
  switch (type) {
    case "company":
      return "bg-blue-50 text-blue-700 hover:bg-blue-100";
    case "person":
      return "bg-green-50 text-green-700 hover:bg-green-100";
    case "protocol":
      return "bg-purple-50 text-purple-700 hover:bg-purple-100";
    case "concept":
      return "bg-amber-50 text-amber-700 hover:bg-amber-100";
    case "opportunity":
      return "bg-indigo-50 text-indigo-700 hover:bg-indigo-100";
    default:
      return "bg-gray-50 text-gray-700 hover:bg-gray-100";
  }
}

export function CoOccurrenceChips({ coOccurrences }: CoOccurrenceChipsProps) {
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
        <Link key={entity.id} href={`/entities/${entity.slug}`}>
          <Badge
            className={`${getTypeColor(entity.type)} font-mono text-xs cursor-pointer transition-colors`}
          >
            {entity.canonical_name}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
