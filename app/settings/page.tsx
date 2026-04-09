"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "../logo.png";
import { ChevronLeft, Save, Loader2, User, Ruler, Weight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
    const [form, setForm] = useState({ name: "", height: 0, weight: 0, additionalInfo: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

    useEffect(() => {
        fetch("/api/settings", { headers: { "Authorization": `Bearer ${API_KEY}` } })
            .then(res => res.json())
            .then(data => {
                setForm(data);
                setLoading(false);
            });
    }, []);

    const save = async () => {
        setSaving(true);
        await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
            body: JSON.stringify(form),
        });
        setSaving(false);
        alert("Settings Updated :D");
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
            <div className="max-w-2xl mx-auto space-y-10">
                <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-primary uppercase font-mono text-xs tracking-widest">
                    <ChevronLeft size={16} /> Home
                </Link>

                <h1 className="text-4xl font-black tracking-tighter">NEYO OS SETTINGS</h1>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <User size={14} /> Full Name
                        </label>
                        <input
                            type="text" value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-card border border-border rounded-2xl p-4 text-xl font-bold focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Ruler size={14} /> Height (cm)
                            </label>
                            <input
                                type="number" value={form.height}
                                onChange={e => setForm({ ...form, height: parseInt(e.target.value) })}
                                className="w-full bg-card border border-border rounded-2xl p-4 text-xl font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Weight size={14} /> Weight (kg)
                            </label>
                            <input
                                type="number" value={form.weight}
                                onChange={e => setForm({ ...form, weight: parseInt(e.target.value) })}
                                className="w-full bg-card border border-border rounded-2xl p-4 text-xl font-bold"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Sparkles size={14} /> AI Context (Life Goals / Habits)
                        </label>
                        <textarea
                            rows={4} value={form.additionalInfo}
                            onChange={e => setForm({ ...form, additionalInfo: e.target.value })}
                            placeholder="Tell Neyo OS about your goals..."
                            className="w-full bg-card border border-border rounded-2xl p-4 text-sm leading-relaxed"
                        />
                    </div>

                    <button
                        onClick={save} disabled={saving}
                        className="w-full bg-primary text-primary-foreground p-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-primary/10"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : <><Save size={22} /> Save Changes</>}
                    </button>
                </div>
            </div>
        </div>
    );
}