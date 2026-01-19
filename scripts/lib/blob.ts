// Vercel Blob upload utility for microsite deployment

import { put, list, del } from '@vercel/blob';
import fs from 'fs/promises';
import path from 'path';
import type { Ora } from 'ora';

export interface BlobUploadResult {
  blobPath: string; // The path prefix in blob storage (e.g., "microsites/rwa-defi-jan-2026")
  fileCount: number;
  totalSize: number;
  urls: string[]; // URLs of uploaded files
}

export interface BlobUploadOptions {
  distPath: string; // Local path to the built microsite dist folder
  slug: string; // Microsite slug for organizing in blob storage
  spinner?: Ora;
}

// MIME types for common static assets
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.xml': 'application/xml',
};

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Check if Vercel Blob is configured
 */
export function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

/**
 * Recursively get all files in a directory
 */
async function getAllFiles(dir: string, basePath: string = ''): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      const subFiles = await getAllFiles(fullPath, relativePath);
      files.push(...subFiles);
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }

  return files;
}

/**
 * Upload a built microsite to Vercel Blob storage
 */
export async function uploadToBlob(options: BlobUploadOptions): Promise<BlobUploadResult> {
  const { distPath, slug, spinner } = options;

  if (!isBlobConfigured()) {
    throw new Error('BLOB_READ_WRITE_TOKEN environment variable not set');
  }

  // Verify dist folder exists
  try {
    await fs.access(distPath);
  } catch {
    throw new Error(`Dist folder not found: ${distPath}`);
  }

  const blobPath = `microsites/${slug}`;
  const files = await getAllFiles(distPath);
  const urls: string[] = [];
  let totalSize = 0;

  if (spinner) {
    spinner.text = `Uploading ${files.length} files to blob storage...`;
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const localPath = path.join(distPath, file);
    const blobKey = `${blobPath}/${file}`;

    if (spinner) {
      spinner.text = `Uploading (${i + 1}/${files.length}): ${file}`;
    }

    // Read file content
    const content = await fs.readFile(localPath);
    totalSize += content.length;

    // Upload to Vercel Blob
    const blob = await put(blobKey, content, {
      access: 'public',
      contentType: getMimeType(file),
      addRandomSuffix: false, // Use exact path for predictable URLs
      allowOverwrite: true, // Allow re-uploading if regenerating microsite
    });

    urls.push(blob.url);
  }

  return {
    blobPath,
    fileCount: files.length,
    totalSize,
    urls,
  };
}

/**
 * Delete all files for a microsite from blob storage
 */
export async function deleteFromBlob(slug: string): Promise<number> {
  if (!isBlobConfigured()) {
    throw new Error('BLOB_READ_WRITE_TOKEN environment variable not set');
  }

  const prefix = `microsites/${slug}/`;
  let deletedCount = 0;

  // List all blobs with this prefix
  const { blobs } = await list({ prefix });

  // Delete each blob
  for (const blob of blobs) {
    await del(blob.url);
    deletedCount++;
  }

  return deletedCount;
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
