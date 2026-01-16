"use client";

interface ConfidenceBarProps {
  value: number;
  segments?: number;
  showLabel?: boolean;
}

export function ConfidenceBar({
  value,
  segments = 5,
  showLabel = false,
}: ConfidenceBarProps) {
  const filledSegments = Math.ceil((value / 100) * segments);

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5 h-1.5 flex-1">
        {[...Array(segments)].map((_, i) => (
          <div
            key={i}
            className={`flex-1 ${
              i < filledSegments
                ? "bg-[#3B5FE6]"
                : "bg-[rgba(0,0,0,0.08)]"
            }`}
          />
        ))}
      </div>
      {showLabel && (
        <span className="font-mono text-[10px] text-[rgba(0,0,0,0.45)] w-8 text-right">
          {value}%
        </span>
      )}
    </div>
  );
}
