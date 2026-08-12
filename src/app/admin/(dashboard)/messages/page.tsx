"use client";

import { useState } from "react";
import { Mail, Search, Star, Trash2, Archive, MailOpen } from "lucide-react";

interface Message {
  id: string;
  from: string;
  email: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
  starred: boolean;
  type: "notification" | "alert" | "update" | "system";
}

const typeIndicators: Record<string, string> = {
  notification: "bg-[var(--a-accent)]",
  alert: "bg-[var(--a-error)]",
  update: "bg-[var(--a-success)]",
  system: "bg-[var(--a-text-4)]",
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", from: "SEO Monitor", email: "seo@motionix.com", subject: "New ranking opportunity detected", preview: "Your page 'Best AI Tools 2024' is now ranking #12 for 'top ai tools'. With some optimization, you could reach the top 10.", date: "2 min ago", read: false, starred: false, type: "notification" },
    { id: "2", from: "System", email: "system@motionix.com", subject: "Analytics sync completed", preview: "Successfully synced 30 days of Google Search Console data. 1,247 keywords updated.", date: "1 hour ago", read: false, starred: true, type: "system" },
    { id: "3", from: "Error Monitor", email: "alerts@motionix.com", subject: "3 new 404 errors detected", preview: "Broken links found on /blog/old-post, /tools/removed-tool, and /docs/legacy.", date: "3 hours ago", read: true, starred: false, type: "alert" },
    { id: "4", from: "Content Team", email: "content@motionix.com", subject: "Blog post ready for review", preview: "The draft 'Complete Guide to Technical SEO' is ready for your review. 2,400 words, 8 images.", date: "Yesterday", read: true, starred: false, type: "update" },
    { id: "5", from: "SEO Monitor", email: "seo@motionix.com", subject: "Weekly SEO report", preview: "Impressions up 12%, clicks up 8% compared to last week. 5 keywords entered top 10.", date: "2 days ago", read: true, starred: true, type: "notification" },
    { id: "6", from: "System", email: "system@motionix.com", subject: "Backup completed", preview: "Daily database backup completed successfully. Size: 245MB.", date: "3 days ago", read: true, starred: false, type: "system" },
  ]);

  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "starred">("all");
  const [search, setSearch] = useState("");

  const filtered = messages.filter((m) => {
    if (filter === "unread" && m.read) return false;
    if (filter === "starred" && !m.starred) return false;
    if (search && !m.subject.toLowerCase().includes(search.toLowerCase()) && !m.from.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selectedMessage = messages.find((m) => m.id === selected);

  function toggleRead(id: string) {
    setMessages(messages.map((m) => m.id === id ? { ...m, read: !m.read } : m));
  }

  function toggleStar(id: string) {
    setMessages(messages.map((m) => m.id === id ? { ...m, starred: !m.starred } : m));
  }

  function deleteMessage(id: string) {
    setMessages(messages.filter((m) => m.id !== id));
    if (selected === id) setSelected(null);
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Messages</h1>
        <p className="mt-1 text-[13px] text-[var(--a-text-3)]">
          {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}` : "All caught up"}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        {/* Message list */}
        <div className="admin-card overflow-hidden">
          {/* Filters */}
          <div className="flex items-center gap-2 border-b border-[var(--a-border)] p-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--a-text-4)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search messages..."
                className="w-full rounded-md border border-[var(--a-border)] bg-[var(--a-bg-elevated)] py-2 pl-9 pr-3 text-sm text-[var(--a-text-1)] placeholder:text-[var(--a-text-4)] focus:outline-none focus:ring-2 focus:ring-[var(--a-accent)]/30"
              />
            </div>
            {(["all", "unread", "starred"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f
                    ? "bg-[var(--a-accent)]/15 text-[var(--a-accent)]"
                    : "text-[var(--a-text-4)] hover:text-[var(--a-text-2)]"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="divide-y divide-[var(--a-border)] max-h-[600px] overflow-y-auto admin-scrollbar">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-[var(--a-text-4)]">
                <Mail className="size-8 mb-2 opacity-40" />
                <p className="text-sm">No messages</p>
              </div>
            ) : (
              filtered.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => {
                    setSelected(msg.id);
                    if (!msg.read) toggleRead(msg.id);
                  }}
                  className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-[var(--a-bg-hover)] ${
                    selected === msg.id ? "bg-[var(--a-bg-elevated)]" : ""
                  } ${!msg.read ? "bg-[var(--a-accent)]/5" : ""}`}
                >
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${typeIndicators[msg.type]}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[13px] truncate ${!msg.read ? "font-semibold text-[var(--a-text-1)]" : "text-[var(--a-text-2)]"}`}>
                        {msg.from}
                      </span>
                      <span className="ml-auto shrink-0 text-[11px] text-[var(--a-text-4)]">{msg.date}</span>
                    </div>
                    <p className={`text-[13px] truncate ${!msg.read ? "font-medium text-[var(--a-text-1)]" : "text-[var(--a-text-3)]"}`}>
                      {msg.subject}
                    </p>
                    <p className="text-[12px] text-[var(--a-text-4)] truncate mt-0.5">{msg.preview}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleStar(msg.id); }}
                      className={`p-1 rounded transition-colors ${msg.starred ? "text-[var(--a-warning)]" : "text-[var(--a-text-4)] hover:text-[var(--a-warning)]"}`}
                    >
                      <Star className="size-3.5" fill={msg.starred ? "currentColor" : "none"} />
                    </button>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message detail */}
        <div className="admin-card p-6">
          {selectedMessage ? (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--a-text-1)]">{selectedMessage.subject}</h2>
                  <p className="text-sm text-[var(--a-text-3)] mt-1">
                    From: <span className="text-[var(--a-text-2)]">{selectedMessage.from}</span> ({selectedMessage.email})
                  </p>
                  <p className="text-[11px] text-[var(--a-text-4)] mt-0.5">{selectedMessage.date}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleRead(selectedMessage.id)}
                    className="grid size-8 place-items-center rounded-md text-[var(--a-text-4)] hover:bg-[var(--a-bg-hover)] hover:text-[var(--a-text-1)] transition-colors"
                    title={selectedMessage.read ? "Mark unread" : "Mark read"}
                  >
                    <MailOpen className="size-4" />
                  </button>
                  <button
                    onClick={() => toggleStar(selectedMessage.id)}
                    className={`grid size-8 place-items-center rounded-md transition-colors ${selectedMessage.starred ? "text-[var(--a-warning)]" : "text-[var(--a-text-4)] hover:bg-[var(--a-bg-hover)] hover:text-[var(--a-warning)]"}`}
                  >
                    <Star className="size-4" fill={selectedMessage.starred ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="grid size-8 place-items-center rounded-md text-[var(--a-text-4)] hover:bg-[var(--a-bg-hover)] hover:text-[var(--a-error)] transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <div className="border-t border-[var(--a-border)] pt-4">
                <p className="text-sm text-[var(--a-text-2)] leading-relaxed">{selectedMessage.preview}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-[var(--a-text-4)]">
              <Mail className="size-10 mb-3 opacity-40" />
              <p className="text-sm">Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
