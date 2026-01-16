"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function OpportunityChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/opportunities/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage.content }),
      });

      const data = await res.json();

      if (res.ok) {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Error: ${data.error || "Failed to process query"}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Error: Failed to connect to the server",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="font-mono text-xs uppercase tracking-[0.05em] text-[rgba(0,0,0,0.35)]">
              Ask questions about your pipeline
            </p>
            <div className="mt-4 space-y-2">
              <p className="font-serif text-xs text-[rgba(0,0,0,0.45)] italic">
                "What opportunities are in the Qualified stage?"
              </p>
              <p className="font-serif text-xs text-[rgba(0,0,0,0.45)] italic">
                "Show me all opportunities related to RWA"
              </p>
              <p className="font-serif text-xs text-[rgba(0,0,0,0.45)] italic">
                "Summarize our BD pipeline"
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 ${
                  message.role === "user"
                    ? "bg-[#3B5FE6] text-white"
                    : "bg-white border border-[rgba(0,0,0,0.08)]"
                }`}
              >
                <p
                  className={`font-serif text-sm whitespace-pre-wrap ${
                    message.role === "user" ? "" : "text-[#171717]"
                  }`}
                >
                  {message.content}
                </p>
                <p
                  className={`font-mono text-[10px] mt-2 ${
                    message.role === "user"
                      ? "text-white/60"
                      : "text-[rgba(0,0,0,0.35)]"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-[rgba(0,0,0,0.08)] px-4 py-3">
              <span className="font-mono text-xs uppercase tracking-[0.05em] text-[rgba(0,0,0,0.45)]">
                Thinking...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[rgba(0,0,0,0.08)] p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your opportunities..."
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            {loading ? "..." : "Send"}
          </Button>
        </form>
      </div>
    </div>
  );
}
