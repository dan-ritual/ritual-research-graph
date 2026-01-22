"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MODE_CONFIGS,
  type CrossLinkInsert,
  type CrossLinkRecord,
  type ModeId,
} from "@ritual-research/core";
import { fetchWithMode } from "@/lib/fetch-with-mode";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LinkDirection = "outbound" | "inbound";

interface CrossLinksPanelProps {
  modeId: ModeId;
  entityId: string;
  entityType: string;
  availableModes: ModeId[];
  canCreate?: boolean;
}

type CrossLinksResponse = {
  links: CrossLinkRecord[];
  error?: string;
};

const DEFAULT_LINK_TYPE = "related";

function formatModeLabel(mode: ModeId): string {
  return MODE_CONFIGS[mode]?.shortName ?? mode;
}

function formatTypeLabel(type: string): string {
  return type.replace(/_/g, " ");
}

export function CrossLinksPanel({
  modeId,
  entityId,
  entityType,
  availableModes,
  canCreate = true,
}: CrossLinksPanelProps) {
  const [links, setLinks] = useState<CrossLinkRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const [direction, setDirection] = useState<LinkDirection>("outbound");
  const [otherMode, setOtherMode] = useState<ModeId>(
    availableModes.includes(modeId)
      ? modeId
      : availableModes[0] ?? modeId
  );
  const [otherType, setOtherType] = useState("");
  const [otherId, setOtherId] = useState("");
  const [linkType, setLinkType] = useState(DEFAULT_LINK_TYPE);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formNotice, setFormNotice] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLinks() {
      setIsLoading(true);
      setFetchError(null);
      try {
        const params = new URLSearchParams({
          mode: modeId,
          entityId,
          direction: "both",
          limit: "200",
        });
        const res = await fetchWithMode(`/api/cross-links?${params.toString()}`);
        const data = (await res.json()) as CrossLinksResponse;
        if (!res.ok) {
          setFetchError(data.error || "Failed to load cross-links.");
          setLinks([]);
          return;
        }
        setLinks(data.links || []);
      } catch (error) {
        console.error("Failed to fetch cross-links:", error);
        setFetchError("Failed to load cross-links.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchLinks();
  }, [modeId, entityId, entityType, refreshIndex]);

  const outboundLinks = useMemo(
    () =>
      links.filter(
        (link) => link.source_mode === modeId && link.source_id === entityId
      ),
    [links, modeId, entityId]
  );

  const inboundLinks = useMemo(
    () =>
      links.filter(
        (link) => link.target_mode === modeId && link.target_id === entityId
      ),
    [links, modeId, entityId]
  );

  const showCreate = canCreate && availableModes.length > 0;

  const handleCreateLink = async () => {
    setFormError(null);
    setFormNotice(null);

    const normalizedType = otherType.trim();
    const normalizedId = otherId.trim();
    const normalizedLinkType = linkType.trim();

    if (!normalizedType || !normalizedId || !normalizedLinkType) {
      setFormError("Mode, type, id, and link type are required.");
      return;
    }

    if (otherMode === modeId && normalizedId === entityId) {
      setFormError("Target entity must be different.");
      return;
    }

    const payload: CrossLinkInsert =
      direction === "outbound"
        ? {
            source_mode: modeId,
            source_type: entityType,
            source_id: entityId,
            target_mode: otherMode,
            target_type: normalizedType,
            target_id: normalizedId,
            link_type: normalizedLinkType,
          }
        : {
            source_mode: otherMode,
            source_type: normalizedType,
            source_id: normalizedId,
            target_mode: modeId,
            target_type: entityType,
            target_id: entityId,
            link_type: normalizedLinkType,
          };

    setIsSaving(true);
    try {
      const res = await fetchWithMode("/api/cross-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data?.error || "Failed to create cross-link.");
        return;
      }
      setOtherType("");
      setOtherId("");
      setFormNotice("Cross-link created.");
      setRefreshIndex((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to create cross-link:", error);
      setFormError("Failed to create cross-link.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderLinks = (list: CrossLinkRecord[], directionLabel: string) => {
    if (isLoading) {
      return (
        <p className="font-mono text-[10px] uppercase text-[rgba(0,0,0,0.45)]">
          Loading...
        </p>
      );
    }

    if (fetchError) {
      return (
        <p className="font-mono text-[10px] uppercase text-[#dc2626]">
          {fetchError}
        </p>
      );
    }

    if (list.length === 0) {
      return (
        <p className="font-serif text-sm italic text-[rgba(0,0,0,0.45)]">
          No {directionLabel} links.
        </p>
      );
    }

    return (
      <div className="space-y-2">
        {list.map((link) => {
          const isOutbound = directionLabel === "outbound";
          const other = isOutbound
            ? {
                mode: link.target_mode,
                type: link.target_type,
                id: link.target_id,
              }
            : {
                mode: link.source_mode,
                type: link.source_type,
                id: link.source_id,
              };

          return (
            <div
              key={link.id}
              className="border border-[rgba(0,0,0,0.08)] p-2 space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="dotted" className="text-[10px]">
                    {formatModeLabel(other.mode)}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {formatTypeLabel(other.type)}
                  </Badge>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)]">
                  {link.link_type}
                </span>
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)]">
                Entity ID
              </div>
              <div className="font-mono text-xs break-all text-[rgba(0,0,0,0.75)]">
                {other.id}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.65)]">
          Cross-Links
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)]">
              Outbound
            </span>
            <span className="font-mono text-[10px] uppercase text-[rgba(0,0,0,0.35)]">
              {outboundLinks.length}
            </span>
          </div>
          {renderLinks(outboundLinks, "outbound")}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)]">
              Inbound
            </span>
            <span className="font-mono text-[10px] uppercase text-[rgba(0,0,0,0.35)]">
              {inboundLinks.length}
            </span>
          </div>
          {renderLinks(inboundLinks, "inbound")}
        </div>

        {showCreate && (
          <div className="pt-4 border-t border-dotted border-[rgba(0,0,0,0.12)] space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)]">
              Create Link
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-[0.08em] text-[rgba(0,0,0,0.5)]">
                  Direction
                </Label>
                <Select value={direction} onValueChange={(value) => setDirection(value as LinkDirection)}>
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outbound">Outbound</SelectItem>
                    <SelectItem value="inbound">Inbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="font-mono text-[10px] uppercase tracking-[0.08em] text-[rgba(0,0,0,0.5)]">
                  {direction === "outbound" ? "Target Mode" : "Source Mode"}
                </Label>
                <Select value={otherMode} onValueChange={(value) => setOtherMode(value as ModeId)}>
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModes.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {formatModeLabel(mode)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="font-mono text-[10px] uppercase tracking-[0.08em] text-[rgba(0,0,0,0.5)]">
                  {direction === "outbound" ? "Target Type" : "Source Type"}
                </Label>
                <Input
                  value={otherType}
                  onChange={(event) => setOtherType(event.target.value)}
                  placeholder="e.g. feature, person"
                  className="mt-1 font-mono text-xs"
                />
              </div>

              <div>
                <Label className="font-mono text-[10px] uppercase tracking-[0.08em] text-[rgba(0,0,0,0.5)]">
                  {direction === "outbound" ? "Target ID" : "Source ID"}
                </Label>
                <Input
                  value={otherId}
                  onChange={(event) => setOtherId(event.target.value)}
                  placeholder="UUID"
                  className="mt-1 font-mono text-xs"
                />
              </div>

              <div>
                <Label className="font-mono text-[10px] uppercase tracking-[0.08em] text-[rgba(0,0,0,0.5)]">
                  Link Type
                </Label>
                <Input
                  value={linkType}
                  onChange={(event) => setLinkType(event.target.value)}
                  placeholder="related"
                  className="mt-1 font-mono text-xs"
                />
              </div>
            </div>

            {formError && (
              <p className="font-mono text-[10px] uppercase text-[#dc2626]">
                {formError}
              </p>
            )}
            {formNotice && !formError && (
              <p className="font-mono text-[10px] uppercase text-[rgba(0,0,0,0.45)]">
                {formNotice}
              </p>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              disabled={isSaving}
              onClick={handleCreateLink}
            >
              {isSaving ? "Linking..." : "Create Link"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
