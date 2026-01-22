/**
 * Google Drive API client using native fetch
 * Uses provider_token from Supabase OAuth session
 */

const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";

export interface DriveFolder {
  id: string;
  name: string;
  mimeType: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
}

export interface DriveListResponse<T> {
  files: T[];
  nextPageToken?: string;
}

/**
 * List folders in a parent folder (or root if no parentId)
 */
export async function listFolders(
  accessToken: string,
  parentId?: string
): Promise<DriveFolder[]> {
  const query = parentId
    ? `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
    : `'root' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

  const params = new URLSearchParams({
    q: query,
    fields: "files(id,name,mimeType)",
    orderBy: "name",
    pageSize: "100",
  });

  const response = await fetch(`${DRIVE_API_BASE}/files?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Drive API error: ${response.status} - ${error}`);
  }

  const data: DriveListResponse<DriveFolder> = await response.json();
  return data.files || [];
}

/**
 * List transcript files in a folder (Google Docs, .txt, .md)
 */
export async function listTranscriptFiles(
  accessToken: string,
  folderId?: string
): Promise<DriveFile[]> {
  // Query for Google Docs, text files, and markdown files
  const mimeTypes = [
    "application/vnd.google-apps.document",
    "text/plain",
    "text/markdown",
    "text/x-markdown",
  ];

  const mimeQuery = mimeTypes.map((m) => `mimeType = '${m}'`).join(" or ");
  const parentQuery = folderId ? `'${folderId}' in parents` : `'root' in parents`;
  const query = `${parentQuery} and (${mimeQuery}) and trashed = false`;

  const params = new URLSearchParams({
    q: query,
    fields: "files(id,name,mimeType,modifiedTime,size)",
    orderBy: "modifiedTime desc",
    pageSize: "50",
  });

  const response = await fetch(`${DRIVE_API_BASE}/files?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Drive API error: ${response.status} - ${error}`);
  }

  const data: DriveListResponse<DriveFile> = await response.json();
  return data.files || [];
}

/**
 * Get file content - handles both Google Docs (export) and regular files (download)
 */
export async function getFileContent(
  accessToken: string,
  fileId: string,
  mimeType: string
): Promise<string> {
  let url: string;

  if (mimeType === "application/vnd.google-apps.document") {
    // Export Google Doc as plain text
    url = `${DRIVE_API_BASE}/files/${fileId}/export?mimeType=text/plain`;
  } else {
    // Download regular file
    url = `${DRIVE_API_BASE}/files/${fileId}?alt=media`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Drive API error: ${response.status} - ${error}`);
  }

  return response.text();
}

/**
 * Check if a token has Drive scope by attempting a simple API call
 */
export async function checkDriveAccess(accessToken: string): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      pageSize: "1",
      fields: "files(id)",
    });

    const response = await fetch(`${DRIVE_API_BASE}/files?${params}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}
