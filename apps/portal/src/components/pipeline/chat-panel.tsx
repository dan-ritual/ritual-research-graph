"use client";

import { useEffect, useCallback } from "react";
import { useChatPanel } from "./chat-context";
import { OpportunityChat } from "./opportunity-chat";

export function ChatPanel() {
  const { isOpen, mode, closeChat, toggleMode } = useChatPanel();

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeChat();
      }
    },
    [isOpen, closeChat]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when expanded mode is open
  useEffect(() => {
    if (isOpen && mode === "expanded") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, mode]);

  const isCompact = mode === "compact";

  // Panel positioning classes based on mode
  const panelClasses = isCompact
    ? // Compact: fixed bottom-right corner, 400x500
      "fixed bottom-6 right-6 w-[400px] h-[500px] rounded-lg shadow-xl"
    : // Expanded: anchored to right edge, full height
      "fixed top-0 right-0 bottom-0 w-[420px] shadow-2xl";

  return (
    <>
      {/* Backdrop (only in expanded mode) */}
      {mode === "expanded" && (
        <div
          className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-200 ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={closeChat}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        className={`
          ${panelClasses}
          bg-[#FBFBFB] z-50 border-l border-[rgba(0,0,0,0.08)]
          flex flex-col transition-all duration-200 ease-out
          ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
          ${isCompact ? "border border-[rgba(0,0,0,0.12)]" : ""}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Pipeline Chat"
        style={{
          transform: isOpen
            ? "translateX(0) scale(1)"
            : isCompact
              ? "translateX(0) scale(0.95)"
              : "translateX(100%)",
        }}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(0,0,0,0.08)] bg-white">
          <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-[#3B5FE6]">
            Pipeline Chat
          </h2>
          <div className="flex items-center gap-2">
            {/* Expand/Collapse toggle */}
            <button
              onClick={toggleMode}
              className="h-7 w-7 flex items-center justify-center text-[rgba(0,0,0,0.45)] hover:text-[#3B5FE6] transition-colors"
              aria-label={isCompact ? "Expand panel" : "Collapse panel"}
              title={isCompact ? "Expand" : "Collapse"}
            >
              {isCompact ? (
                // Expand icon (arrows pointing outward)
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              ) : (
                // Collapse icon (arrows pointing inward)
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="4 14 10 14 10 20" />
                  <polyline points="20 10 14 10 14 4" />
                  <line x1="14" y1="10" x2="21" y2="3" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              )}
            </button>

            {/* Close button */}
            <button
              onClick={closeChat}
              className="h-7 w-7 flex items-center justify-center font-mono text-xs text-[rgba(0,0,0,0.45)] hover:text-[#171717] transition-colors"
              aria-label="Close chat panel"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden">
          <OpportunityChat />
        </div>
      </div>
    </>
  );
}
