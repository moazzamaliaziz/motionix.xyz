"use client";

import { useState } from "react";
import { GripVertical, Plus, X } from "lucide-react";

interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  tasks: KanbanTask[];
}

const priorityColors: Record<string, string> = {
  low: "bg-[var(--a-info)]/15 text-[var(--a-info)]",
  medium: "bg-[var(--a-warning)]/15 text-[var(--a-warning)]",
  high: "bg-[var(--a-error)]/15 text-[var(--a-error)]",
};

export default function KanbanPage() {
  const [columns, setColumns] = useState<KanbanColumn[]>([
    {
      id: "todo",
      title: "To Do",
      color: "var(--a-text-4)",
      tasks: [
        { id: "1", title: "Research competitor keywords", description: "Analyze top 5 competitors", priority: "high" },
        { id: "2", title: "Write meta descriptions", priority: "medium" },
        { id: "3", title: "Fix 404 errors", priority: "high" },
      ],
    },
    {
      id: "progress",
      title: "In Progress",
      color: "var(--a-warning)",
      tasks: [
        { id: "4", title: "Publish blog post on AI tools", description: "Draft ready, needs review", priority: "medium" },
        { id: "5", title: "Update sitemap", priority: "low" },
      ],
    },
    {
      id: "review",
      title: "Review",
      color: "var(--a-accent)",
      tasks: [
        { id: "6", title: "Internal linking audit", priority: "medium" },
      ],
    },
    {
      id: "done",
      title: "Done",
      color: "var(--a-success)",
      tasks: [
        { id: "7", title: "Submit to Google Search Console", priority: "low" },
        { id: "8", title: "Optimize images for SEO", priority: "low" },
      ],
    },
  ]);

  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [dragging, setDragging] = useState<{ taskId: string; fromCol: string } | null>(null);

  function addTask(colId: string) {
    if (!newTitle.trim()) return;
    setColumns(columns.map((col) => {
      if (col.id === colId) {
        return {
          ...col,
          tasks: [...col.tasks, { id: String(Date.now()), title: newTitle, priority: "medium" as const }],
        };
      }
      return col;
    }));
    setNewTitle("");
    setAddingTo(null);
  }

  function removeTask(colId: string, taskId: string) {
    setColumns(columns.map((col) => {
      if (col.id === colId) {
        return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) };
      }
      return col;
    }));
  }

  function handleDragStart(taskId: string, fromCol: string) {
    setDragging({ taskId, fromCol });
  }

  function handleDrop(toCol: string) {
    if (!dragging || dragging.fromCol === toCol) {
      setDragging(null);
      return;
    }

    const task = columns.find((c) => c.id === dragging.fromCol)?.tasks.find((t) => t.id === dragging.taskId);
    if (!task) { setDragging(null); return; }

    setColumns(columns.map((col) => {
      if (col.id === dragging.fromCol) {
        return { ...col, tasks: col.tasks.filter((t) => t.id !== dragging.taskId) };
      }
      if (col.id === toCol) {
        return { ...col, tasks: [...col.tasks, task] };
      }
      return col;
    }));
    setDragging(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Kanban Board</h1>
        <p className="mt-1 text-[13px] text-[var(--a-text-3)]">Manage your SEO and content tasks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => (
          <div
            key={col.id}
            className="flex flex-col rounded-xl border border-[var(--a-border)] bg-[var(--a-bg-surface)]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.id)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between border-b border-[var(--a-border)] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: col.color }} />
                <h3 className="text-sm font-semibold text-[var(--a-text-1)]">{col.title}</h3>
                <span className="grid min-w-5 place-items-center rounded-full bg-[var(--a-bg-elevated)] px-1.5 text-[0.625rem] font-semibold text-[var(--a-text-4)]">
                  {col.tasks.length}
                </span>
              </div>
              <button
                onClick={() => setAddingTo(addingTo === col.id ? null : col.id)}
                className="grid size-7 place-items-center rounded-md text-[var(--a-text-4)] hover:bg-[var(--a-bg-hover)] hover:text-[var(--a-text-1)] transition-colors"
              >
                <Plus className="size-4" />
              </button>
            </div>

            {/* Add task form */}
            {addingTo === col.id && (
              <div className="border-b border-[var(--a-border)] p-3">
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Task title..."
                  className="w-full rounded-md border border-[var(--a-border)] bg-[var(--a-bg-elevated)] px-3 py-2 text-sm text-[var(--a-text-1)] placeholder:text-[var(--a-text-4)] focus:outline-none focus:ring-2 focus:ring-[var(--a-accent)]/30"
                  onKeyDown={(e) => e.key === "Enter" && addTask(col.id)}
                  autoFocus
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => addTask(col.id)}
                    className="flex-1 rounded-md bg-[var(--a-accent)] py-1.5 text-xs font-medium text-white hover:opacity-90"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setAddingTo(null); setNewTitle(""); }}
                    className="rounded-md bg-[var(--a-bg-hover)] px-3 py-1.5 text-xs text-[var(--a-text-3)] hover:text-[var(--a-text-1)]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Tasks */}
            <div className="flex-1 space-y-2 p-3 min-h-[200px]">
              {col.tasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id, col.id)}
                  className="group admin-card admin-card-hover cursor-grab active:cursor-grabbing p-3"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="mt-0.5 size-3.5 shrink-0 text-[var(--a-text-4)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-[var(--a-text-1)]">{task.title}</p>
                      {task.description && (
                        <p className="mt-1 text-[11px] text-[var(--a-text-4)]">{task.description}</p>
                      )}
                      <span className={`mt-2 inline-flex rounded-md px-2 py-0.5 text-[0.625rem] font-semibold ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    <button
                      onClick={() => removeTask(col.id, task.id)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--a-text-4)] hover:text-[var(--a-error)]"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
