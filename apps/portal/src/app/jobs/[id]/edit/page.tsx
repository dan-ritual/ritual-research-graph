"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArtifactEditor } from "@/components/artifacts";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { ArrowLeft, FileText, Users } from "lucide-react";

interface Section {
  id: string;
  header: string;
  level: number;
  content: string;
  startLine: number;
  endLine: number;
  editedAt?: string;
  originalContent?: string;
}

interface Artifact {
  id: string;
  type: string;
  content: string;
  sections: Section[];
  last_edited_at?: string;
  original_content?: string;
}

interface Job {
  id: string;
  title: string;
  status: string;
}

export default function EditArtifactsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: jobId } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [job, setJob] = useState<Job | null>(null);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(
    null
  );

  useEffect(() => {
    async function fetchData() {
      // Check auth
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch job and artifacts
      const response = await fetch(`/api/jobs/${jobId}/artifacts`);
      if (!response.ok) {
        router.push("/");
        return;
      }

      const data = await response.json();
      setJob(data.job);

      // Fetch full artifact data with sections
      const artifactsWithSections = await Promise.all(
        data.artifacts.map(async (a: Artifact) => {
          const res = await fetch(`/api/jobs/${jobId}/artifacts/${a.id}`);
          if (res.ok) {
            const artData = await res.json();
            return artData.artifact;
          }
          return a;
        })
      );

      setArtifacts(artifactsWithSections);

      // Select first artifact by default
      if (artifactsWithSections.length > 0) {
        setSelectedArtifactId(artifactsWithSections[0].id);
      }

      setLoading(false);
    }

    fetchData();
  }, [jobId, router, supabase]);

  const handleSaveArtifact = useCallback(
    async (updatedArtifact: Artifact) => {
      const response = await fetch(
        `/api/jobs/${jobId}/artifacts/${updatedArtifact.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sections: updatedArtifact.sections,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setArtifacts((prev) =>
          prev.map((a) => (a.id === updatedArtifact.id ? data.artifact : a))
        );
      }
    },
    [jobId]
  );

  const handleRegenerateMicrosite = useCallback(async () => {
    const response = await fetch(`/api/jobs/${jobId}/regenerate-microsite`, {
      method: "POST",
    });

    if (response.ok) {
      // Show success message or redirect
      router.push(`/jobs/${jobId}`);
    }
  }, [jobId, router]);

  const selectedArtifact = artifacts.find((a) => a.id === selectedArtifactId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB]">
      {/* Header */}
      <header className="border-b border-[rgba(0,0,0,0.08)] bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/jobs/${jobId}`}
              className="text-[rgba(0,0,0,0.45)] hover:text-[#3B5FE6] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-display text-lg font-semibold text-[#171717]">
                Edit Artifacts
              </h1>
              <p className="font-mono text-xs text-[rgba(0,0,0,0.45)]">
                {job?.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/jobs/${jobId}/review`}>
              <Button
                variant="outline"
                size="sm"
                className="font-mono text-xs uppercase tracking-[0.05em]"
              >
                <Users className="h-3 w-3 mr-2" />
                Review Entities
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Artifact list */}
        <aside className="w-64 border-r border-[rgba(0,0,0,0.08)] bg-white min-h-[calc(100vh-64px)]">
          <div className="p-4">
            <h2 className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)] mb-4">
              Artifacts
            </h2>
            <div className="space-y-1">
              {artifacts.map((artifact) => {
                const hasEdits = artifact.last_edited_at || artifact.sections?.some(s => s.editedAt);
                return (
                  <button
                    key={artifact.id}
                    onClick={() => setSelectedArtifactId(artifact.id)}
                    className={`w-full text-left px-3 py-2 transition-colors ${
                      selectedArtifactId === artifact.id
                        ? "bg-[#3B5FE6]/10 border-l-2 border-[#3B5FE6]"
                        : "hover:bg-[rgba(0,0,0,0.02)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[rgba(0,0,0,0.45)]" />
                      <span className="font-mono text-xs uppercase tracking-[0.05em] truncate">
                        {artifact.type.replace(/_/g, " ")}
                      </span>
                    </div>
                    {hasEdits && (
                      <span className="ml-6 font-mono text-[10px] text-[#3B5FE6]">
                        edited
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main content - Editor */}
        <main className="flex-1 p-6">
          {selectedArtifact ? (
            <ArtifactEditor
              artifact={selectedArtifact}
              jobId={jobId}
              onSave={handleSaveArtifact}
              onRegenerateMicrosite={handleRegenerateMicrosite}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-[rgba(0,0,0,0.45)]">
              <p className="font-serif text-sm italic">
                Select an artifact to edit
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
