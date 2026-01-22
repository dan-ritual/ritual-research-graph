import { DEFAULT_MODE_ID, MODE_CONFIGS, getSchemaTable, type ModeId } from "@ritual-research/core";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

function resolveModeId(value?: string | null): ModeId {
  if (value && value in MODE_CONFIGS) {
    return value as ModeId;
  }
  return DEFAULT_MODE_ID;
}

async function updateMicrositeBlob(slug: string, blobPath: string, modeId: ModeId) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Missing Supabase credentials");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Update microsite record with blob_path
  const { data, error } = await supabase
    .from(getSchemaTable("microsites", modeId))
    .update({ blob_path: blobPath })
    .eq("slug", slug)
    .select()
    .single();

  if (error) {
    console.error("Failed to update microsite:", error);
    process.exit(1);
  }

  console.log(`✅ Updated microsite "${slug}" with blob_path: ${blobPath}`);
  console.log("Updated record:", data);
}

// Run
const args = process.argv.slice(2);
const modeIndex = args.indexOf("--mode");
const modeArg = modeIndex >= 0 ? args[modeIndex + 1] : undefined;
if (modeIndex >= 0) {
  args.splice(modeIndex, 2);
}

const slug = args[0];
const blobPath = args[1];
const modeId = resolveModeId(modeArg);

if (!slug || !blobPath) {
  console.log("Usage: npx tsx scripts/update-microsite-blob.ts <slug> <blob-path> [--mode <mode>]");
  process.exit(1);
}

updateMicrositeBlob(slug, blobPath, modeId);
