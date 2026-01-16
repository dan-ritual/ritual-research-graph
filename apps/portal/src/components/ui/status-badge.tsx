import { Badge } from "@/components/ui/badge";
import { getStatusConfig } from "@/constants";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

/**
 * Badge component for displaying job/pipeline status.
 * Automatically maps status strings to appropriate labels and colors.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
