"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "../logo.png";
import {
  CheckCircle2,
  Smile,
  Brain,
  Calendar,
  Plus,
  ArrowRight,
  Loader2,
  TrendingDown,
  Wind,
  LayoutDashboard,
  Shield
} from "lucide-react";
import Link from "next/link";

type Habit = { id: string; name: string; frequency?: string };
type MoodEntry = { id: string; mood: number; energyLevel?: number; createdAt: string };
type Task = { id: string; title: string; priority: string; status: string };
type Thought = { id: string; content: string; tags?: string[] };

export default function DashboardPage() {
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY; // import api key

  const [data, setData] = useState<{
    habits: Habit[];
    moods: MoodEntry[];
    tasks: Task[];
    thoughts: Thought[];
    userName: string;
  }>({ habits: [], moods: [], tasks: [], thoughts: [], userName: "User" });
  const [loading, setLoading] = useState(true);

  const [greeting, setGreeting] = useState("Good Day");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const fetchData = async () => {
      try {
        const fetchOptions: RequestInit = {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        };
        const [habRes, moodRes, taskRes, thoughtRes, settingsRes] = await Promise.all([
          fetch("/api/habits", fetchOptions),
          fetch("/api/mood", fetchOptions),
          fetch("/api/tasks", fetchOptions),
          fetch("/api/journal", fetchOptions),
          fetch("/api/settings", fetchOptions),
        ]);

        const [habits, moods, tasks, thoughts, settings] = await Promise.all([
          habRes.json(),
          moodRes.json(),
          taskRes.json(),
          thoughtRes.json(),
          settingsRes.json(),
        ]);

        setData({
          habits: Array.isArray(habits) ? habits : [],
          moods: Array.isArray(moods) ? moods : [],
          tasks: Array.isArray(tasks) ? tasks : [],
          thoughts: Array.isArray(thoughts) ? thoughts : [],
          userName: settings && settings.name ? settings.name : "User"
        });
      } catch (e) {
        console.error("Dashboard failed to sync:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-muted-foreground gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse" />
          <Image src={logo} alt="NeyoOS" width={60} height={60} className="relative z-10 opacity-50 animate-pulse grayscale" />
        </div>
        <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-muted-foreground/30 animate-pulse border-t border-border/10 pt-4">Loading...</p>
      </div>
    );
  }

  const stats = [
    { label: "Habits", value: data.habits.length, icon: Calendar, color: "text-foreground", href: "/habits" },
    { label: "Mood", value: data.moods.length > 0 ? (data.moods.reduce((acc, m) => acc + m.mood, 0) / data.moods.length).toFixed(1) : "—", icon: Smile, color: "text-foreground", href: "/mood" },
    { label: "Tasks", value: data.tasks.filter(t => t.status !== "done").length, icon: CheckCircle2, color: "text-foreground", href: "/tasks" },
    { label: "Journal", value: data.thoughts.length, icon: Brain, color: "text-foreground", href: "/journal" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 font-sans">
      <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-12">

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-[0.2em]">
              <Shield size={16} /> Neyo OS
            </div>
            <h1 className="text-5xl font-serif italic tracking-tight">
              {greeting}, <span className="text-primary not-italic font-sans font-black">{data.userName}</span>
            </h1>
            <p className="text-muted-foreground font-medium max-w-md">
              You have {data.tasks.filter(t => t.status !== "done").length} tasks pending today.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href={"/settings"}>
              <button className="h-12 px-6 rounded-full border border-border hover:bg-accent transition-all font-bold text-sm">
                Settings
              </button>
            </Link>
            <Link href={"/journal"}>
              <button className="h-12 px-6 rounded-full bg-primary text-primary-foreground hover:opacity-90 shadow-xl shadow-primary/10 transition-all font-bold text-sm flex items-center gap-2">
                <Plus size={18} /> New Entry
              </button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <div className="group p-8 rounded-[2rem] bg-card border border-border hover:border-primary/30 transition-all cursor-crosshair h-full">
                <div className="flex flex-col gap-6">
                  <div className="p-3 bg-secondary w-fit rounded-2xl group-hover:rotate-12 transition-transform">
                    <stat.icon size={20} className="text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-4xl font-black">{stat.value}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          <section className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black flex items-center gap-3">
                Tasks
              </h2>
              <Link href="/tasks">
                <button className="text-xs font-mono uppercase tracking-tighter text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  View all Tasks <ArrowRight size={14} />
                </button>
              </Link>
            </div>

            <div className="space-y-3">
              {data.tasks.slice(0, 6).map(task => (
                <div key={task.id} className="bg-card p-5 rounded-3xl border border-border flex items-center justify-between group hover:bg-accent/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${task.status === "done" ? "bg-primary" : "bg-muted"
                      }`} />
                    <div>
                      <h3 className={`font-bold ${task.status === "done" ? "text-muted-foreground line-through" : ""}`}>
                        {task.title}
                      </h3>
                      <p className="text-[10px] font-mono text-muted-foreground uppercase">{task.priority || "Standard"} Priority</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
                </div>
              ))}
              {data.tasks.length === 0 && (
                <div className="py-12 border-2 border-dashed border-border rounded-3xl text-center">
                  <p className="text-muted-foreground font-mono text-sm">No Task Found!</p>
                </div>
              )}
            </div>
          </section>

          <aside className="lg:col-span-4 space-y-10">

            <div className="relative overflow-hidden bg-primary text-primary-foreground p-10 rounded-[3rem] shadow-2xl shadow-primary/20">
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-70">Mood</span>
                  <TrendingDown size={18} className="opacity-50" />
                </div>
                <div>
                  <p className="text-7xl font-black">{data.moods[0]?.mood || "—"}</p>
                  <p className="font-mono text-xs mt-2 opacity-80">Today</p>
                </div>
                <p className="text-sm border-t border-primary-foreground/20 pt-4 opacity-90 font-medium leading-relaxed">
                  Your mood is looking {data.moods.length > 0 ? "good" : "neutral"} this week.
                </p>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-mono uppercase tracking-[0.2em] text-muted-foreground">Recent Journals</h3>
              <div className="space-y-4">
                {data.thoughts.slice(0, 2).map(t => (
                  <div key={t.id} className="p-6 rounded-2xl bg-secondary/30 border border-border/50">
                    <p className="text-sm leading-relaxed italic opacity-80 leading-relaxed font-serif">"{t.content}"</p>
                    {t.tags && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {t.tags.map(tag => (
                          <span key={tag} className="text-[9px] font-mono border border-border px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}