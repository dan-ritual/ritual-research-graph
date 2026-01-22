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
import { MODE_CONFIGS, type ModeId } from "@ritual-research/core";

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
  /** Mode prefix for links (e.g., "/growth") */
  modePrefix?: string;
  modeId?: ModeId;
}

export function EntityCard({
  entity,
  variant = "default",
  modePrefix = "",
  modeId,
}: EntityCardProps) {
  const typeConfig = modeId ? MODE_CONFIGS[modeId]?.entityTypes.find((et) => et.id === entity.type) : null;
  const typeLabel = typeConfig?.label || entity.type;
  const status =
    entity.metadata && typeof entity.metadata === "object" && "status" in entity.metadata
      ? (entity.metadata as { status?: string }).status
      : undefined;
  const owner =
    entity.metadata && typeof entity.metadata === "object" && "owner" in entity.metadata
      ? (entity.metadata as { owner?: string }).owner
      : undefined;
  const badgeClass =
    "bg-[color-mix(in_srgb,var(--mode-accent)_12%,transparent)] text-[var(--mode-accent)]";
  const href = `${modePrefix}/entities/${entity.slug}`;

  if (variant === "compact") {
    return (
      <Card>
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-sm font-semibold">
              {entity.canonical_name}
            </CardTitle>
            <Badge className={`${badgeClass} font-mono text-[10px] uppercase`}>
              {typeLabel}
            </Badge>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="hover:border-[var(--mode-accent)]/30 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="font-display text-lg font-semibold">
            {entity.canonical_name}
          </CardTitle>
          <Badge className={`${badgeClass} font-mono text-[10px] uppercase`}>
            {typeLabel}
          </Badge>
        </div>
        {entity.metadata?.description && (
          <CardDescription className="font-serif text-sm line-clamp-2 italic">
            {entity.metadata.description}
          </CardDescription>
        )}
        {(status || owner) && (
          <div className="mt-2 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.05em] text-[rgba(0,0,0,0.45)]">
            {status && <span>Status: {status.replace(/_/g, " ")}</span>}
            {owner && <span>Owner: {owner}</span>}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="font-mono text-xs text-[rgba(0,0,0,0.45)]">
            <span className="uppercase tracking-[0.05em]">
              {entity.appearance_count || 0} appearances
            </span>
          </div>
          <Link href={href}>
            <Button variant="ghost" size="sm">
              View
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
