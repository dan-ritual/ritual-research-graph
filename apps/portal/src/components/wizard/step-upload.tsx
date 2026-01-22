"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TranscriptData {
  content: string;
  filename: string;
}

interface StepUploadProps {
  onComplete: (data: TranscriptData) => void;
}

export function StepUpload({ onComplete }: StepUploadProps) {
  const [content, setContent] = useState("");
  const [filename, setFilename] = useState("pasted-transcript.md");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.name.endsWith(".md") && !file.name.endsWith(".txt")) {
      setError("Please upload a .md or .txt file");
      return;
    }

    try {
      const text = await file.text();
      setContent(text);
      setFilename(file.name);
    } catch {
      setError("Failed to read file");
    }
  }, []);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        setContent(text);
        setFilename(file.name);
      } catch {
        setError("Failed to read file");
      }
    },
    []
  );

  const handleNext = () => {
    if (!content.trim()) {
      setError("Please enter or upload a transcript");
      return;
    }
    if (content.length < 100) {
      setError("Transcript seems too short. Please provide more content.");
      return;
    }
    onComplete({ content, filename });
  };

  const preview = content.slice(0, 500);
  const hasMore = content.length > 500;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold mb-1">Upload Transcript</h2>
        <p className="font-serif text-sm text-[rgba(0,0,0,0.45)] italic">
          Drag and drop a file or paste your transcript below
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border border-dashed p-8 text-center transition-colors ${
          isDragging
            ? "border-[var(--mode-accent)] bg-[var(--mode-accent)]/5"
            : "border-[rgba(0,0,0,0.15)] hover:border-[var(--mode-accent)]/50"
        }`}
      >
        <div className="text-[rgba(0,0,0,0.45)]">
          <p className="font-serif mb-2">Drop your .md or .txt file here</p>
          <p className="font-mono text-xs uppercase tracking-[0.05em]">or</p>
          <label className="mt-2 inline-block">
            <input
              type="file"
              accept=".md,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <span className="font-mono text-xs uppercase tracking-[0.05em] text-[var(--mode-accent)] cursor-pointer border-b border-dotted border-[var(--mode-accent)]/50 hover:border-[var(--mode-accent)]">
              Browse files
            </span>
          </label>
        </div>
      </div>

      {/* Paste Area */}
      <div>
        <Label htmlFor="transcript" className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)] mb-2 block">
          Or paste your transcript
        </Label>
        <Textarea
          id="transcript"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setError(null);
          }}
          placeholder="Paste your meeting transcript here..."
          className="min-h-[200px] font-mono text-sm border-[rgba(0,0,0,0.08)]"
        />
        {content && (
          <p className="font-mono text-xs text-[rgba(0,0,0,0.45)] mt-1">
            {content.length.toLocaleString()} characters
            {filename !== "pasted-transcript.md" && ` • ${filename}`}
          </p>
        )}
      </div>

      {/* Preview */}
      {content && (
        <div>
          <Label className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)] mb-2 block">
            Preview
          </Label>
          <div className="bg-[#F5F5F5] p-4 text-sm font-mono whitespace-pre-wrap max-h-[150px] overflow-auto border border-[rgba(0,0,0,0.05)]">
            {preview}
            {hasMore && (
              <span className="text-[rgba(0,0,0,0.45)]">
                ... ({(content.length - 500).toLocaleString()} more characters)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="font-mono text-sm text-[#dc2626]">{error}</p>
      )}

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!content.trim()}>
          Next
        </Button>
      </div>
    </div>
  );
}
