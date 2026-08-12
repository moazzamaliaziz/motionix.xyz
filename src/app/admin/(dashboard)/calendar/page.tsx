"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, X } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: "blog" | "seo" | "social" | "task";
}

const typeColors: Record<string, string> = {
  blog: "bg-[var(--a-accent)]/20 text-[var(--a-accent)] border-[var(--a-accent)]/30",
  seo: "bg-[var(--a-success)]/20 text-[var(--a-success)] border-[var(--a-success)]/30",
  social: "bg-[var(--a-pink)]/20 text-[var(--a-pink)] border-[var(--a-pink)]/30",
  task: "bg-[var(--a-warning)]/20 text-[var(--a-warning)] border-[var(--a-warning)]/30",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: "1", title: "Publish SEO guide", date: new Date().toISOString().split("T")[0], time: "10:00", type: "blog" },
    { id: "2", title: "Keyword research review", date: new Date(Date.now() + 86400000).toISOString().split("T")[0], time: "14:00", type: "seo" },
    { id: "3", title: "Social media schedule", date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0], type: "social" },
    { id: "4", title: "Fix broken links", date: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0], type: "task" },
  ]);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<CalendarEvent["type"]>("blog");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [year, month]);

  const today = new Date().toISOString().split("T")[0];

  function formatDate(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function getEventsForDay(day: number) {
    return events.filter((e) => e.date === formatDate(day));
  }

  function addEvent() {
    if (!newTitle.trim() || !selectedDate) return;
    setEvents([...events, { id: String(Date.now()), title: newTitle, date: selectedDate, type: newType }]);
    setNewTitle("");
    setShowAdd(false);
  }

  function removeEvent(id: string) {
    setEvents(events.filter((e) => e.id !== id));
  }

  const selectedEvents = selectedDate ? events.filter((e) => e.date === selectedDate) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Calendar</h1>
        <p className="mt-1 text-[13px] text-[var(--a-text-3)]">Schedule content and track tasks.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        {/* Calendar grid */}
        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="grid size-9 place-items-center rounded-lg text-[var(--a-text-3)] hover:bg-[var(--a-bg-hover)] hover:text-[var(--a-text-1)] transition-colors"
            >
              <ChevronLeft className="size-5" />
            </button>
            <h2 className="text-lg font-semibold text-[var(--a-text-1)]">
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="grid size-9 place-items-center rounded-lg text-[var(--a-text-3)] hover:bg-[var(--a-bg-hover)] hover:text-[var(--a-text-1)] transition-colors"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-px">
            {DAYS.map((d) => (
              <div key={d} className="p-2 text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--a-text-4)]">
                {d}
              </div>
            ))}
            {calendarDays.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} className="p-2" />;
              const dateStr = formatDate(day);
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDate;
              const dayEvents = getEventsForDay(day);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`relative flex flex-col items-center rounded-lg p-2 min-h-[72px] transition-colors ${
                    isSelected
                      ? "bg-[var(--a-accent)]/15 ring-1 ring-[var(--a-accent)]"
                      : isToday
                      ? "bg-[var(--a-bg-elevated)]"
                      : "hover:bg-[var(--a-bg-hover)]"
                  }`}
                >
                  <span className={`text-sm font-medium ${isToday ? "text-[var(--a-accent)]" : "text-[var(--a-text-2)]"}`}>
                    {day}
                  </span>
                  <div className="mt-1 flex flex-wrap gap-0.5 justify-center">
                    {dayEvents.slice(0, 3).map((e) => (
                      <span key={e.id} className={`size-1.5 rounded-full ${
                        e.type === "blog" ? "bg-[var(--a-accent)]" :
                        e.type === "seo" ? "bg-[var(--a-success)]" :
                        e.type === "social" ? "bg-[var(--a-pink)]" :
                        "bg-[var(--a-warning)]"
                      }`} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar: selected day events */}
        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--a-text-1)]">
              {selectedDate ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "Select a day"}
            </h3>
            {selectedDate && (
              <button
                onClick={() => setShowAdd(!showAdd)}
                className="admin-btn admin-focus grid size-8 place-items-center rounded-full bg-[var(--a-accent)] text-white hover:opacity-90"
              >
                <Plus className="size-4" />
              </button>
            )}
          </div>

          {showAdd && selectedDate && (
            <div className="mb-4 rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-elevated)] p-4">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Event title..."
                className="w-full rounded-md border border-[var(--a-border)] bg-[var(--a-bg-surface)] px-3 py-2 text-sm text-[var(--a-text-1)] placeholder:text-[var(--a-text-4)] focus:outline-none focus:ring-2 focus:ring-[var(--a-accent)]/30"
                onKeyDown={(e) => e.key === "Enter" && addEvent()}
              />
              <div className="mt-2 flex gap-2">
                {(["blog", "seo", "social", "task"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewType(t)}
                    className={`rounded-md px-2.5 py-1 text-[0.6875rem] font-semibold border ${
                      newType === t ? typeColors[t] : "border-[var(--a-border)] text-[var(--a-text-4)]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button
                onClick={addEvent}
                className="mt-3 w-full rounded-md bg-[var(--a-accent)] py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                Add Event
              </button>
            </div>
          )}

          {selectedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[var(--a-text-4)]">
              <Clock className="size-8 mb-2 opacity-40" />
              <p className="text-sm">No events for this day</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((event) => (
                <div
                  key={event.id}
                  className={`group flex items-center justify-between rounded-lg border p-3 ${typeColors[event.type]}`}
                >
                  <div>
                    <p className="text-sm font-medium">{event.title}</p>
                    {event.time && <p className="text-[11px] opacity-70 mt-0.5">{event.time}</p>}
                  </div>
                  <button
                    onClick={() => removeEvent(event.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
