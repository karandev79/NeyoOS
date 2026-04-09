"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "../logo.png";
import { ChevronLeft, Plus, Loader2, Check } from "lucide-react";
import Link from "next/link";

type Habit = { id: string; name: string; color: string };
type HabitLog = { habitId: string; date: string; completed: boolean };

const Days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function HabitsPage() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [logs, setLogs] = useState<HabitLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [newHabitName, setNewHabitName] = useState("");

    const API_KEY = process.env.NEXT_PUBLIC_API_KEY; // get apikey from .env

    const getWeekDates = () => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        return Days.map((_, i) => {
            const d = new Date(now.setDate(diff + i));
            return d.toISOString().split('T')[0];
        });
    };

    const weekDates = getWeekDates();
    const fetchData = async () => {
        const headers = { "Authorization": `Bearer ${API_KEY}` };
        const [hRes, lRes] = await Promise.all([
            fetch("/api/habits", { headers, cache: 'no-store' }),

            fetch("/api/habits/logs", { headers, cache: 'no-store' })
        ]);
        const habitsData = await hRes.json();
        const logsData = await lRes.json();
        setHabits(Array.isArray(habitsData) ? habitsData : []);
        setLogs(Array.isArray(logsData) ? logsData : []);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const toggleHabit = async (habitId: string, date: string) => {
        const isCompleted = logs.some(l => l.habitId === habitId && l.date === date && l.completed);
        const nextState = !isCompleted;

        setLogs(prev => {
            const filtered = prev.filter(l => !(l.habitId === habitId && l.date === date));
            return [...filtered, { habitId, date, completed: nextState }];
        });

        await fetch("/api/habits/logs", {

            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
            body: JSON.stringify({ habitId, date, completed: nextState }),
        });
    };

    const addHabit = async () => {
        if (!newHabitName.trim()) return;
        await fetch("/api/habits", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
            body: JSON.stringify({ name: newHabitName }),
        });
        setNewHabitName("");
        fetchData();
    };

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

    return (
        <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-10">

                <header className="flex items-center justify-between">

                    <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-primary uppercase font-mono text-xs tracking-widest text-[10px]">
                        <ChevronLeft size={14} /> Home
                    </Link>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic">Weekly Planner</h1>
                </header>

                <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-border/50">
                                    <th className="p-8 text-xs font-mono uppercase tracking-[0.2em] opacity-40">Activities</th>
                                    {Days.map(day => (
                                        <th key={day} className="p-4 text-[10px] font-mono uppercase tracking-widest opacity-40 text-center">
                                            <span className="block mb-1">-</span> {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {habits.map((habit) => (
                                    <tr key={habit.id} className="group hover:bg-white/[0.02] transition-colors">

                                        <td className="p-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: habit.color || '#6366f1' }} />
                                                <span className="font-bold text-lg tracking-tight">{habit.name}</span>
                                            </div>
                                        </td>
                                        {weekDates.map(date => {
                                            const isDone = logs.some(l => l.habitId === habit.id && l.date === date && l.completed);
                                            return (
                                                <td key={date} className="p-4 text-center">
                                                    <button
                                                        onClick={() => toggleHabit(habit.id, date)}
                                                        className={`w-8 h-8 rounded-xl border transition-all flex items-center justify-center
                              ${isDone
                                                                ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                                : "bg-secondary/20 border-border hover:border-primary/50"}`}>
                                                        {isDone && <Check size={16} strokeWidth={4} />}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan={8} className="p-6">
                                        <div className="flex items-center gap-4 opacity-30 hover:opacity-100 transition-opacity">
                                            <Plus size={16} />
                                            <input
                                                placeholder="Deploy new activity!!"
                                                value={newHabitName}
                                                onChange={e => setNewHabitName(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && addHabit()}
                                                className="bg-transparent border-none focus:ring-0 text-sm font-mono w-full"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}