"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MODE_CONFIGS, type ModeId } from "@ritual-research/core";

interface EntityTypeFilterProps {
  value: string;
  onChange: (value: string) => void;
  /** Optional mode to get entity types from mode config */
  mode?: ModeId;
}

// Default entity types (used when mode is not provided)
const DEFAULT_ENTITY_TYPES = [
  { value: "all", label: "All Types" },
  { value: "company", label: "Company" },
  { value: "protocol", label: "Protocol" },
  { value: "person", label: "Person" },
  { value: "concept", label: "Concept" },
  { value: "opportunity", label: "Opportunity" },
];

export function EntityTypeFilter({ value, onChange, mode }: EntityTypeFilterProps) {
  // Get entity types from mode config or use defaults
  let entityTypes = DEFAULT_ENTITY_TYPES;
  
  if (mode && MODE_CONFIGS[mode]) {
    const modeConfig = MODE_CONFIGS[mode];
    entityTypes = [
      { value: "all", label: "All Types" },
      ...modeConfig.entityTypes.map(et => ({
        value: et.id,
        label: et.label,
      })),
    ];
  }

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
