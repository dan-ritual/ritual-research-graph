"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_MODE_ID, MODE_CONFIGS, type ModeId } from "@ritual-research/core";

interface EntityTypeFilterProps {
  value: string;
  onChange: (value: string) => void;
  /** Optional mode to get entity types from mode config */
  mode?: ModeId;
}

export function EntityTypeFilter({ value, onChange, mode }: EntityTypeFilterProps) {
  const modeConfig = MODE_CONFIGS[mode || DEFAULT_MODE_ID];
  const entityTypes = [
    { value: "all", label: "All Types" },
    ...modeConfig.entityTypes.map((et) => ({
      value: et.id,
      label: et.label,
    })),
  ];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[160px] font-mono text-xs uppercase tracking-[0.05em]">
        <SelectValue placeholder="Filter by type" />
      </SelectTrigger>
      <SelectContent>
        {entityTypes.map((type) => (
          <SelectItem
            key={type.value}
            value={type.value}
            className="font-mono text-xs uppercase tracking-[0.05em]"
          >
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
