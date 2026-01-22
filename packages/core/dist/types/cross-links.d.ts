import type { ModeId } from "../modes/types.js";
export type CrossLinkMode = ModeId;
export interface CrossLinkRecord {
    id: string;
    source_mode: ModeId;
    source_type: string;
    source_id: string;
    target_mode: ModeId;
    target_type: string;
    target_id: string;
    link_type: string;
    confidence: number | null;
    created_by: string | null;
    created_at: string;
    metadata: Record<string, unknown>;
}
export interface CrossLinkInsert {
    source_mode: ModeId;
    source_type: string;
    source_id: string;
    target_mode: ModeId;
    target_type: string;
    target_id: string;
    link_type: string;
    confidence?: number | null;
    metadata?: Record<string, unknown>;
}
