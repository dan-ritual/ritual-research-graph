import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface Appearance {
  id: string;
  section: string;
  context: string | null;
  sentiment: string | null;
  created_at: string;
  microsites: {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    created_at: string;
  } | null;
}

interface AppearanceListProps {
  appearances: Appearance[];
}

function formatSection(section: string): string {
  return section
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function AppearanceList({ appearances }: AppearanceListProps) {
  if (appearances.length === 0) {
    return (
      <p className="font-serif text-sm italic text-[rgba(0,0,0,0.45)]">
        No appearances found.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {appearances.map((appearance) => {
        if (!appearance.microsites) return null;
        const microsite = appearance.microsites;

        return (
          <Link
            key={appearance.id}
            href={`/microsites/${microsite.slug}`}
            className="block"
          >
            <Card className="hover:border-[#3B5FE6]/30 transition-colors">
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-sm font-semibold truncate">
                      {microsite.title}
                    </h4>
                    {appearance.context && (
                      <p className="font-serif text-sm italic text-[rgba(0,0,0,0.65)] line-clamp-2 mt-1">
                        &ldquo;{appearance.context}&rdquo;
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-[rgba(0,0,0,0.45)]">
                        Section: {formatSection(appearance.section)}
                      </span>
                      <span className="font-mono text-[10px] text-[rgba(0,0,0,0.35)]">
                        {new Date(microsite.created_at).toLocaleDateString(
                          "en-US",
                          { month: "short", year: "numeric" }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
