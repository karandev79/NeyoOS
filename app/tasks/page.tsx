"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Trash2,
  Plus,
  ChevronLeft,
  ArrowUpDown,
  Loader2,
  Calendar
} from "lucide-react";
import Link from "next/link";

type TaskStatus = "todo" | "done";
type TaskPriority = "low" | "medium" | "high";

type Task = {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("medium");

  const API_KEY = process.env.API_KEY // get api key from .env file

  // load tasks
  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks", {
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
        },
      });
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Sync failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  // add tasks
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ title: newTitle, priority: newPriority, status: "todo" }),
    });

    if (res.ok) {
      setNewTitle("");
      fetchTasks();
    }
  };

  // update tasks

  const toggleTask = async (id: string, currentStatus: TaskStatus) => {
    const nextStatus = currentStatus === "done" ? "todo" : "done";
    setTasks(tasks.map(t => t.id === id ? { ...t, status: nextStatus } : t));

    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ status: nextStatus }),
    });
  };

  const deleteTask = async (id: string) => {     // / delete task
    if (!confirm("Are you sure?")) return;
    setTasks(tasks.filter(t => t.id !== id));
    await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 font-sans transition-colors">
      <div className="max-w-5xl mx-auto space-y-10">

        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-mono uppercase tracking-widest">
            <ChevronLeft size={16} /> Back
          </Link>
          <div className="text-right">
            <h1 className="text-4xl font-black tracking-tighter">Tasks</h1>
            <p className="text-muted-foreground text-sm">{tasks.filter(t => t.status !== "done").length} tasks pending</p>
          </div>
        </div>

        <form onSubmit={addTask} className="flex flex-col md:flex-row gap-4 p-6 bg-card border border-border rounded-3xl shadow-sm">
          <div className="flex-1">
            <input
              type="text"
              placeholder="What's our goal? :D"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="bg-transparent border-none text-xl font-bold w-full focus:ring-0 placeholder:opacity-30"
            />
          </div>
          <div className="flex items-center gap-4">
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
              className="bg-secondary text-xs font-mono uppercase px-3 py-2 rounded-xl border-none focus:ring-1 focus:ring-primary"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button type="submit" className="bg-primary text-primary-foreground p-3 rounded-2xl hover:opacity-90 transition-all font-bold flex items-center gap-2">
              <Plus size={20} /> Add
            </button>
          </div>
        </form>

        <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-secondary/30 border-b border-border">
              <tr className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                <th className="p-6 w-16">Status</th>
                <th className="p-6">Task Description</th>
                <th className="p-6 w-32">Priority</th>
                <th className="p-6 w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tasks.map((task) => (
                <tr key={task.id} className="group hover:bg-accent/30 transition-colors">
                  <td className="p-6">
                    <button onClick={() => toggleTask(task.id, task.status)} className="text-muted-foreground hover:text-primary transition-all">
                      {task.status === "done" ? <CheckCircle2 className="text-primary" /> : <Circle />}
                    </button>
                  </td>
                  <td className="p-6">
                    <div>
                      <p className={`font-bold text-lg ${task.status === "done" ? "line-through opacity-40" : ""}`}>
                        {task.title}
                      </p>
                      {task.description && <p className="text-xs text-muted-foreground mt-1">{task.description}</p>}
                    </div>
                  </td>
                  <td className="p-6 uppercase">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full border border-border ${task.priority === "high" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        task.priority === "medium" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                          "bg-slate-500/10 text-slate-500 border-slate-500/20"
                      }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button onClick={() => deleteTask(task.id)} className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-muted-foreground font-mono italic">
                    Seems like there're no tasks!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}