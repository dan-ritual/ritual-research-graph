"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

type ChatMode = "compact" | "expanded";

interface ChatContextValue {
  isOpen: boolean;
  mode: ChatMode;
  hasUnread: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  setMode: (mode: ChatMode) => void;
  toggleMode: () => void;
  markRead: () => void;
  markUnread: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>("compact");
  const [hasUnread, setHasUnread] = useState(false);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setHasUnread(false); // Mark as read when opened
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) setHasUnread(false); // Mark as read when opening
      return !prev;
    });
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "compact" ? "expanded" : "compact"));
  }, []);

  const markRead = useCallback(() => setHasUnread(false), []);
  const markUnread = useCallback(() => setHasUnread(true), []);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        mode,
        hasUnread,
        openChat,
        closeChat,
        toggleChat,
        setMode,
        toggleMode,
        markRead,
        markUnread,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatPanel() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatPanel must be used within a ChatProvider");
  }
  return context;
}
