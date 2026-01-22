"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EmailDraft {
  subject: string;
  body: string;
}

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailDraft: EmailDraft | null;
}

export function EmailModal({ isOpen, onClose, emailDraft }: EmailModalProps) {
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  const copyToClipboard = async (text: string, type: "subject" | "body") => {
    await navigator.clipboard.writeText(text);
    if (type === "subject") {
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } else {
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    }
  };

  if (!emailDraft) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white border border-[rgba(0,0,0,0.08)]">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm uppercase tracking-[0.12em]">
            Generated Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Subject */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)]">
                Subject
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(emailDraft.subject, "subject")}
                className="text-[10px] h-6 px-2"
              >
                {copiedSubject ? "COPIED" : "COPY"}
              </Button>
            </div>
            <div className="border border-[rgba(0,0,0,0.08)] p-3 bg-[#FBFBFB]">
              <p className="font-serif text-sm">{emailDraft.subject}</p>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)]">
                Body
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(emailDraft.body, "body")}
                className="text-[10px] h-6 px-2"
              >
                {copiedBody ? "COPIED" : "COPY"}
              </Button>
            </div>
            <div className="border border-[rgba(0,0,0,0.08)] p-3 bg-[#FBFBFB] max-h-64 overflow-y-auto">
              <p className="font-serif text-sm whitespace-pre-wrap">
                {emailDraft.body}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-dotted border-[color-mix(in_srgb,var(--mode-accent)_30%,transparent)]">
          <Button variant="outline" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
