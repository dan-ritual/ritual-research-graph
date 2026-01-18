import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

async function updateMicrositeBlob(slug: string, blobPath: string) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Missing Supabase credentials");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Update microsite record with blob_path
  const { data, error } = await supabase
    .from("microsites")
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
const slug = process.argv[2];
const blobPath = process.argv[3];

if (!slug || !blobPath) {
  console.log("Usage: npx tsx scripts/update-microsite-blob.ts <slug> <blob-path>");
  process.exit(1);
}

updateMicrositeBlob(slug, blobPath);
