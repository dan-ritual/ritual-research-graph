"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface EntitySearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function EntitySearchInput({
  value,
  onChange,
  placeholder = "Search entities...",
}: EntitySearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgba(0,0,0,0.3)]" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 font-mono text-sm"
      />
    </div>
  );
}
