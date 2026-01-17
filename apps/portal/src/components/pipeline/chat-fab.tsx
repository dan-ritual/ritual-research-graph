"use client";

import { useChatPanel } from "./chat-context";

export function ChatFAB() {
  const { toggleChat, hasUnread, isOpen } = useChatPanel();

  return (
    <button
      onClick={toggleChat}
      className={`
        relative inline-flex items-center gap-2 px-4 py-2
        font-mono text-xs uppercase tracking-[0.05em]
        border transition-all duration-150
        ${
          isOpen
            ? "bg-[#3B5FE6] text-white border-[#3B5FE6]"
            : "bg-white text-[#3B5FE6] border-[#3B5FE6] hover:bg-[#3B5FE6] hover:text-white"
        }
      `}
      aria-label={isOpen ? "Close chat" : "Open chat"}
    >
      {/* Chat icon */}
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
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>

      <span>Ask</span>

      {/* Unread indicator dot */}
      {hasUnread && !isOpen && (
        <span
          className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#EF4444] animate-pulse"
          aria-label="New response available"
        />
      )}
    </button>
  );
}
