import type { ModeConfig } from "./types.js";

export const skunkworksConfig: ModeConfig = {
  id: "skunkworks",
  name: "Ritual Skunkworks",
  shortName: "Skunkworks",
  description: "Product ideas, prototypes, internal innovation.",
  accent: "#E63B3B",
  accentLight: "#FF9B9B",
  entityTypes: [
    {
      id: "idea",
      label: "Idea",
      labelPlural: "Ideas",
      icon: "Lightbulb",
      fields: [
        { id: "name", label: "Name", type: "string", required: true },
        { id: "summary", label: "Summary", type: "text", required: false },
        { id: "status", label: "Status", type: "enum", required: false, options: ["Draft", "Exploring", "Greenlit"] },
      ],
      searchableFields: ["name", "summary"],
    },
    {
      id: "prototype",
      label: "Prototype",
      labelPlural: "Prototypes",
      icon: "FlaskConical",
      fields: [
        { id: "name", label: "Name", type: "string", required: true },
        { id: "owner", label: "Owner", type: "string", required: false },
        { id: "notes", label: "Notes", type: "text", required: false },
      ],
      searchableFields: ["name", "owner", "notes"],
    },
    {
      id: "experiment",
      label: "Experiment",
      labelPlural: "Experiments",
      icon: "Beaker",
      fields: [
        { id: "name", label: "Name", type: "string", required: true },
        { id: "hypothesis", label: "Hypothesis", type: "text", required: false },
        { id: "result", label: "Result", type: "text", required: false },
      ],
      searchableFields: ["name", "hypothesis"],
    },
  ],
  pipelineStages: [],
  navigation: {
    defaultPath: "/dashboard",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
      { label: "Ideas", path: "/ideas", icon: "Lightbulb" },
      { label: "Prototypes", path: "/prototypes", icon: "FlaskConical" },
      { label: "Experiments", path: "/experiments", icon: "Beaker" },
    ],
  },
  features: {
    crossLinking: false,
    externalIntegrations: [],
  },
};
