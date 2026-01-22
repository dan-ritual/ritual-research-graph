import { DEFAULT_MODE_ID, MODE_CONFIGS, getSchemaTable, type ModeId } from "@ritual-research/core";
import { put, list } from "@vercel/blob";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function resolveModeId(value?: string | null): ModeId {
  if (value && value in MODE_CONFIGS) {
    return value as ModeId;
  }
  return DEFAULT_MODE_ID;
}

async function uploadMicrosite(
  sourceDir: string,
  micrositeSlug: string,
  modeId: ModeId
) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("Missing BLOB_READ_WRITE_TOKEN");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Upload all files from source directory
  const blobPath = `microsites/${micrositeSlug}`;
  const uploadedFiles: string[] = [];

  async function uploadDir(dir: string, prefix: string = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const blobName = `${blobPath}${prefix}/${entry.name}`;

      if (entry.isDirectory()) {
        await uploadDir(fullPath, `${prefix}/${entry.name}`);
      } else {
        const content = fs.readFileSync(fullPath);
        const contentType = getContentType(entry.name);

        console.log(`Uploading: ${blobName}`);
        const blob = await put(blobName, content, {
          access: "public",
          contentType,
        });
        uploadedFiles.push(blob.url);
      }
    }
  }

  await uploadDir(sourceDir);

  // Update microsite record with blob_path
  const { error } = await supabase
    .from(getSchemaTable("microsites", modeId))
    .update({ blob_path: blobPath })
    .eq("slug", micrositeSlug);

  if (error) {
    console.error("Failed to update microsite:", error);
  } else {
    console.log(`\nSuccess! Updated microsite ${micrositeSlug} with blob_path: ${blobPath}`);
    console.log(`Uploaded ${uploadedFiles.length} files`);
  }
}

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const types: Record<string, string> = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
  };
  return types[ext] || "application/octet-stream";
}

// Run
const args = process.argv.slice(2);
const modeIndex = args.indexOf("--mode");
const modeArg = modeIndex >= 0 ? args[modeIndex + 1] : undefined;
if (modeIndex >= 0) {
  args.splice(modeIndex, 2);
}

const sourceDir = args[0];
const slug = args[1];
const modeId = resolveModeId(modeArg);

if (!sourceDir || !slug) {
  console.log("Usage: npx tsx scripts/upload-microsite.ts <source-dir> <microsite-slug> [--mode <mode>]");
  process.exit(1);
}

uploadMicrosite(sourceDir, slug, modeId);
