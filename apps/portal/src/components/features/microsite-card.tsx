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

interface Microsite {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  thesis?: string | null;
  entity_count?: number | null;
  visibility?: string | null;
  created_at: string;
}

interface MicrositeCardProps {
  microsite: Microsite;
  /** Variant for different display contexts */
  variant?: "default" | "compact";
}

/**
 * Card component for displaying microsite summary.
 * Used in dashboard recent items and microsites listing.
 */
export function MicrositeCard({
  microsite,
  variant = "default",
}: MicrositeCardProps) {
  const isInternal = microsite.visibility === "internal";

  if (variant === "compact") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base font-semibold">
            {microsite.title}
          </CardTitle>
          <CardDescription className="font-serif text-sm line-clamp-2 italic">
            {microsite.subtitle || microsite.thesis}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[rgba(0,0,0,0.45)] uppercase tracking-[0.05em]">
              {microsite.entity_count || 0} entities
            </span>
            <Link href={`/microsites/${microsite.slug}`}>
              <Button variant="ghost" size="sm">
                View
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:border-[#3B5FE6]/30 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="font-display text-lg font-semibold">
            {microsite.title}
          </CardTitle>
          {isInternal && <Badge variant="dotted">Internal</Badge>}
        </div>
        <CardDescription className="font-serif text-sm line-clamp-2 italic">
          {microsite.subtitle || microsite.thesis}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="font-mono text-xs text-[rgba(0,0,0,0.45)]">
            <span className="uppercase tracking-[0.05em]">
              {microsite.entity_count || 0} entities
            </span>
            <span className="mx-2">·</span>
            <span>{new Date(microsite.created_at).toLocaleDateString()}</span>
          </div>
          <Link href={`/microsites/${microsite.slug}`}>
            <Button variant="ghost" size="sm">
              View
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
