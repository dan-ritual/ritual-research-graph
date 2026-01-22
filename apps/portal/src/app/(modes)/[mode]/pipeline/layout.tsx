"use client";

import { Suspense } from "react";
import { ChatProvider } from "@/components/pipeline/chat-context";
import { ChatPanel } from "@/components/pipeline/chat-panel";
import { Loading } from "@/components/ui/loading";

export default function PipelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center">
          <Loading />
        </div>
      }
    >
      <ChatProvider>
        <div className="min-h-screen bg-[#FBFBFB]">
          {children}
        </div>
        <ChatPanel />
      </ChatProvider>
    </Suspense>
  );
}
