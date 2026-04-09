"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "../logo.png";
import { ChevronLeft, Plus, History, Zap, MessageSquare, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";

type MoodEntry = { id: string; mood: number; energyLevel: number; note: string; createdAt: string };

// states
export default function MoodPage() {
    const [entries, setEntries] = useState<MoodEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [mood, setMood] = useState(7);
    const [energy, setEnergy] = useState(5);
    const [note, setNote] = useState("");

    const API_KEY = process.env.NEXT_PUBLIC_API_KEY // take api key form .env

    const fetchMood = async () => {
        const res = await fetch("/api/mood", {
            headers: { "Authorization": `Bearer ${API_KEY}` },
            cache: `no-store`
        });
        const data = await res.json();
        setEntries(Array.isArray(data) ? data.reverse() : []);
        setLoading(false);
    };

    useEffect(() => { fetchMood(); }, []);
    const saveMood = async () => {
        setSaving(true);
        await fetch("/api/mood", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
            body: JSON.stringify({ mood, energyLevel: energy, note }),
        });
        setNote("");
        await fetchMood();
        setSaving(false);
    };

    const deleteMood = async (id: string) => {
        if (!confirm("Are you sure you want to delete this log?")) return

        setEntries(entries.filter(e => e.id !== id));

        await fetch(`/api/mood/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${API_KEY}` },
        });
    };

    const getEmoji = (val: number) => {
        if (val > 7) return "✨";
        if (val > 5) return "😊";
        if (val > 3) return "😐";
        return "😔";
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
        <div className="min-h-screen bg-background text-foreground p-6 md:p-12 transition-colors">
            <div className="max-w-4xl mx-auto space-y-12">

                <div className="flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-primary uppercase font-mono text-xs tracking-widest">
                        <ChevronLeft size={16} /> home
                    </Link>
                    <div className="text-right">
                        <h1 className="text-4xl font-black tracking-tighter italic uppercase text-primary">Mood Tracker</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    <div className="lg:col-span-7 space-y-8">
                        <div className="bg-card border border-border p-8 rounded-[3rem] space-y-8 shadow-sm">

                            <div className="space-y-4 text-center">
                                <p className="text-7xl">{getEmoji(mood)}</p>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black uppercase tracking-tight">How are you feeling today?</p>
                                    <p className="text-5xl font-serif italic text-primary">{mood}/10</p>
                                </div>
                                <input
                                    type="range" min="1" max="10" value={mood}
                                    onChange={e => setMood(parseInt(e.target.value))}
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest opacity-50">
                                    <span className="flex items-center gap-1"><Zap size={12} /> Energy Level</span>
                                    <span>{energy}/10</span>
                                </div>
                                <input
                                    type="range" min="1" max="10" value={energy}
                                    onChange={e => setEnergy(parseInt(e.target.value))}
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-mono text-[10px] uppercase tracking-widest opacity-50 flex items-center gap-1"><MessageSquare size={12} /> Mood Context (Optional)</label>
                                <textarea
                                    placeholder="Any extra info about your mood?"
                                    value={note} onChange={e => setNote(e.target.value)}
                                    className="w-full bg-secondary/50 border-none rounded-2xl p-4 text-sm focus:ring-1 focus:ring-primary"
                                    rows={3}
                                />
                            </div>

                            <button
                                onClick={saveMood} disabled={saving}
                                className="w-full bg-foreground text-background p-5 rounded-[2rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                            >
                                {saving ? <Loader2 className="animate-spin" /> : <><Plus size={20} /> Log Current Mood</>}
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                        <h3 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mr-4">
                            <History size={14} /> History
                        </h3>

                        <div className="space-y-3">
                            {entries.slice(0, 5).map(entry => (
                                <div key={entry.id} className="p-5 bg-card border border-border rounded-3xl flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl">{getEmoji(entry.mood)}</span>
                                        <div>
                                            <p className="font-bold text-lg">{entry.mood}/10</p>
                                            <p className="text-[10px] font-mono opacity-40 uppercase">
                                                {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(entry.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    {entry.energyLevel > 0 && (
                                        <div className="bg-blue-500/10 text-blue-500 text-[10px] font-black px-2 py-1 rounded-full border border-blue-500/20">
                                            ⚡{entry.energyLevel}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => deleteMood(entry.id)} className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {entries.length === 0 && <p className="text-sm font-mono text-muted-foreground italic text-center py-10 opacity-30">No history recorded so far :(</p>}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}