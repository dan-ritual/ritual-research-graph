"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EntityTypeFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const ENTITY_TYPES = [
  { value: "all", label: "All Types" },
  { value: "company", label: "Company" },
  { value: "protocol", label: "Protocol" },
  { value: "person", label: "Person" },
  { value: "concept", label: "Concept" },
  { value: "opportunity", label: "Opportunity" },
];

export function EntityTypeFilter({ value, onChange }: EntityTypeFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[160px] font-mono text-xs uppercase tracking-[0.05em]">
        <SelectValue placeholder="Filter by type" />
      </SelectTrigger>
      <SelectContent>
        {ENTITY_TYPES.map((type) => (
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
