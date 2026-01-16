"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RetryJobButtonProps {
  jobId: string;
  onRetry?: () => void;
}

export function RetryJobButton({ jobId, onRetry }: RetryJobButtonProps) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRetry = async () => {
    setIsRetrying(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}/retry`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to retry job");
      }

      // Refresh the page to show updated status
      router.refresh();
      onRetry?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsRetrying(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          Retry
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Retry Generation</AlertDialogTitle>
          <AlertDialogDescription>
            This will reset the job and start the generation process from the
            beginning. Any previous artifacts will be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-red-600 font-mono">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRetrying}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRetry} disabled={isRetrying}>
            {isRetrying ? "Retrying..." : "Retry"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface CancelJobButtonProps {
  jobId: string;
  onCancel?: () => void;
}

export function CancelJobButton({ jobId, onCancel }: CancelJobButtonProps) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setIsCancelling(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}/cancel`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to cancel job");
      }

      // Refresh the page to show updated status
      router.refresh();
      onCancel?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsCancelling(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Cancel
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Generation</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel this job? The generation process
            will be stopped and the job will be marked as failed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-red-600 font-mono">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isCancelling}>
            Keep Running
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={isCancelling}
            className="bg-red-600 hover:bg-red-700"
          >
            {isCancelling ? "Cancelling..." : "Cancel Job"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
