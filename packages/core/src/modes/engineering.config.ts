import type { ModeConfig } from "./types.js";

export const engineeringConfig: ModeConfig = {
  id: "engineering",
  name: "Ritual Engineering Graph",
  shortName: "Engineering",
  description: "Engineering wiki, meeting ingestion, feature tracking.",
  accent: "#3BE65B",
  accentLight: "#9BFFB3",
  entityTypes: [
    {
      id: "feature",
      label: "Feature",
      labelPlural: "Features",
      icon: "Sparkles",
      fields: [
        { id: "name", label: "Name", type: "string", required: true },
        { id: "status", label: "Status", type: "enum", required: false, options: ["Idea", "Planned", "In Progress", "Shipped"] },
        { id: "summary", label: "Summary", type: "text", required: false },
      ],
      searchableFields: ["name", "summary"],
    },
    {
      id: "decision",
      label: "Decision",
      labelPlural: "Decisions",
      icon: "Gavel",
      fields: [
        { id: "title", label: "Title", type: "string", required: true },
        { id: "rationale", label: "Rationale", type: "text", required: false },
        { id: "date", label: "Date", type: "date", required: false },
      ],
      searchableFields: ["title", "rationale"],
    },
    {
      id: "topic",
      label: "Topic",
      labelPlural: "Topics",
      icon: "Hash",
      fields: [
        { id: "name", label: "Name", type: "string", required: true },
        { id: "notes", label: "Notes", type: "text", required: false },
      ],
      searchableFields: ["name", "notes"],
    },
    {
      id: "component",
      label: "Component",
      labelPlural: "Components",
      icon: "Puzzle",
      fields: [
        { id: "name", label: "Name", type: "string", required: true },
        { id: "owner", label: "Owner", type: "string", required: false },
        { id: "status", label: "Status", type: "enum", required: false, options: ["Stable", "Deprecated", "Experimental"] },
      ],
      searchableFields: ["name", "owner"],
    },
  ],
  pipelineStages: [],
  navigation: {
    defaultPath: "/dashboard",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
      { label: "Wiki", path: "/wiki", icon: "BookOpen" },
      { label: "Features", path: "/features", icon: "Sparkles" },
      { label: "Decisions", path: "/decisions", icon: "Gavel" },
    ],
  },
  features: {
    crossLinking: false,
    externalIntegrations: ["asana"],
  },
};
