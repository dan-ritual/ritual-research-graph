"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Workflow {
  id: string;
  slug: string;
  name: string;
  description?: string;
  is_default: boolean;
}

interface WorkflowSelectorProps {
  workflows: Workflow[];
  selectedWorkflowId: string;
  onSelect: (workflowId: string) => void;
}

export function WorkflowSelector({
  workflows,
  selectedWorkflowId,
  onSelect,
}: WorkflowSelectorProps) {
  return (
    <Select value={selectedWorkflowId} onValueChange={onSelect}>
      <SelectTrigger className="w-[200px] font-mono text-xs uppercase tracking-[0.05em]">
        <SelectValue placeholder="Select workflow" />
      </SelectTrigger>
      <SelectContent>
        {workflows.map((workflow) => (
          <SelectItem
            key={workflow.id}
            value={workflow.id}
            className="font-mono text-xs"
          >
            {workflow.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
