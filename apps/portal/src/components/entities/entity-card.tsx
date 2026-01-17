import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Entity {
  id: string;
  slug: string;
  canonical_name: string;
  type: string;
  metadata?: {
    description?: string;
    url?: string;
    twitter?: string;
  } | null;
  appearance_count?: number | null;
  updated_at?: string;
}

interface EntityCardProps {
  entity: Entity;
  variant?: "default" | "compact";
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
    case "opportunity":
      return "bg-indigo-100 text-indigo-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function EntityCard({ entity, variant = "default" }: EntityCardProps) {
  const typeColor = getTypeColor(entity.type);

  if (variant === "compact") {
    return (
      <Card>
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-sm font-semibold">
              {entity.canonical_name}
            </CardTitle>
            <Badge className={`${typeColor} font-mono text-[10px] uppercase`}>
              {entity.type}
            </Badge>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="hover:border-[#3B5FE6]/30 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="font-display text-lg font-semibold">
            {entity.canonical_name}
          </CardTitle>
          <Badge className={`${typeColor} font-mono text-[10px] uppercase`}>
            {entity.type}
          </Badge>
        </div>
        {entity.metadata?.description && (
          <CardDescription className="font-serif text-sm line-clamp-2 italic">
            {entity.metadata.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="font-mono text-xs text-[rgba(0,0,0,0.45)]">
            <span className="uppercase tracking-[0.05em]">
              {entity.appearance_count || 0} appearances
            </span>
          </div>
          <Link href={`/entities/${entity.slug}`}>
            <Button variant="ghost" size="sm">
              View
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
