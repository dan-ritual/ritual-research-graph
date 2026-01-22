"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface DriveFolder {
  id: string;
  name: string;
  mimeType: string;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
}

interface DriveImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (content: string, fileName: string) => void;
}

type BreadcrumbItem = { id: string | null; name: string };

export function DriveImportModal({ isOpen, onClose, onImport }: DriveImportModalProps) {
  const [status, setStatus] = useState<"checking" | "needs-auth" | "ready" | "error">("checking");
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([{ id: null, name: "My Drive" }]);

  const currentFolderId = breadcrumb[breadcrumb.length - 1].id;

  // Check Drive connection on mount
  useEffect(() => {
    if (!isOpen) return;
    checkDriveAuth();
  }, [isOpen]);

  // Load folder contents when folder changes
  useEffect(() => {
    if (status === "ready") {
      loadFolderContents();
    }
  }, [status, currentFolderId]);

  const checkDriveAuth = async () => {
    setStatus("checking");
    setError(null);

    try {
      const response = await fetch("/api/drive/auth");
      const data = await response.json();

      if (data.connected) {
        setStatus("ready");
      } else if (data.needsAuth) {
        setStatus("needs-auth");
      } else {
        setStatus("error");
        setError(data.error || "Failed to check Drive connection");
      }
    } catch {
      setStatus("error");
      setError("Failed to connect to server");
    }
  };

  const handleAuthWithDrive = async () => {
    // Drive scope is now requested at initial login.
    // If we get here, user needs to re-login to grant Drive access.
    // Redirect to login which will request all scopes including Drive.
    window.location.href = `/login`;
  };

  const loadFolderContents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = currentFolderId ? `?folderId=${currentFolderId}` : "";
      const [foldersRes, filesRes] = await Promise.all([
        fetch(`/api/drive/folders?parentId=${currentFolderId || ""}`),
        fetch(`/api/drive/files${params}`),
      ]);

      if (!foldersRes.ok || !filesRes.ok) {
        throw new Error("Failed to load folder contents");
      }

      const foldersData = await foldersRes.json();
      const filesData = await filesRes.json();

      setFolders(foldersData.folders || []);
      setFiles(filesData.files || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load folder");
    } finally {
      setLoading(false);
    }
  }, [currentFolderId]);

  const navigateToFolder = (folder: DriveFolder) => {
    setBreadcrumb([...breadcrumb, { id: folder.id, name: folder.name }]);
  };

  const navigateToBreadcrumb = (index: number) => {
    setBreadcrumb(breadcrumb.slice(0, index + 1));
  };

  const handleFileSelect = async (file: DriveFile) => {
    setImporting(true);
    setError(null);

    try {
      const response = await fetch("/api/drive/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: file.id,
          mimeType: file.mimeType,
          fileName: file.name,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to import file");
      }

      const data = await response.json();
      onImport(data.content, data.fileName);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === "application/vnd.google-apps.document") {
      return (
        <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="none" stroke="currentColor" strokeWidth="2"/>
          <polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" strokeWidth="2"/>
          <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
          <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
          <polyline points="10 9 9 9 8 9" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-2xl max-h-[80vh] flex flex-col border border-[rgba(0,0,0,0.08)]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(0,0,0,0.08)]">
          <h2 className="font-display text-lg font-semibold">Import from Google Drive</h2>
          <button
            onClick={onClose}
            className="text-[rgba(0,0,0,0.45)] hover:text-[rgba(0,0,0,0.7)]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {status === "checking" && (
            <div className="text-center py-12">
              <p className="font-mono text-sm uppercase tracking-[0.05em] text-[rgba(0,0,0,0.45)]">
                Checking Drive connection...
              </p>
            </div>
          )}

          {status === "needs-auth" && (
            <div className="text-center py-12">
              <p className="font-serif text-sm text-[rgba(0,0,0,0.65)] mb-4">
                Connect your Google Drive to import transcripts
              </p>
              <Button onClick={handleAuthWithDrive}>
                Connect Google Drive
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-12">
              <p className="font-mono text-sm text-[#dc2626] mb-4">{error}</p>
              <Button variant="outline" onClick={checkDriveAuth}>
                Retry
              </Button>
            </div>
          )}

          {status === "ready" && (
            <>
              {/* Breadcrumb */}
              <div className="flex items-center gap-1 mb-4 font-mono text-xs">
                {breadcrumb.map((item, index) => (
                  <div key={index} className="flex items-center gap-1">
                    {index > 0 && <span className="text-[rgba(0,0,0,0.3)]">/</span>}
                    <button
                      onClick={() => navigateToBreadcrumb(index)}
                      className={`hover:text-[var(--mode-accent)] ${
                        index === breadcrumb.length - 1
                          ? "text-[rgba(0,0,0,0.7)] font-medium"
                          : "text-[rgba(0,0,0,0.45)]"
                      }`}
                    >
                      {item.name}
                    </button>
                  </div>
                ))}
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <p className="font-mono text-sm uppercase tracking-[0.05em] text-[rgba(0,0,0,0.45)]">
                    Loading...
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {/* Folders */}
                  {folders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => navigateToFolder(folder)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[rgba(0,0,0,0.03)] text-left"
                    >
                      <svg className="w-5 h-5 text-[var(--mode-accent)]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z"/>
                      </svg>
                      <span className="font-mono text-sm">{folder.name}</span>
                    </button>
                  ))}

                  {/* Files */}
                  {files.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => handleFileSelect(file)}
                      disabled={importing}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[rgba(0,0,0,0.03)] text-left disabled:opacity-50"
                    >
                      {getFileIcon(file.mimeType)}
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm truncate">{file.name}</p>
                        <p className="font-mono text-xs text-[rgba(0,0,0,0.45)]">
                          {formatDate(file.modifiedTime)}
                        </p>
                      </div>
                    </button>
                  ))}

                  {folders.length === 0 && files.length === 0 && (
                    <div className="text-center py-8">
                      <p className="font-serif text-sm text-[rgba(0,0,0,0.45)] italic">
                        No folders or transcript files in this location
                      </p>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <p className="font-mono text-sm text-[#dc2626] mt-4">{error}</p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-[rgba(0,0,0,0.08)]">
          <Button variant="outline" onClick={onClose} disabled={importing}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
