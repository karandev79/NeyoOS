"use client";

import { useState } from "react";
import Image from "next/image";
import logo from "../logo.png";
import { ChevronLeft, Sparkles, Terminal as TerminalIcon, Shield, Cpu, RefreshCw } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const TIME_OPTIONS = [
    { id: "today", label: "01: Today", value: "today" },
    { id: "week", label: "07: This Week", value: "week" },
    { id: "month", label: "30: This Month", value: "month" },
];

const DATA_TYPES = [
    { id: "moods", label: "Emotional stats", value: "moods" },
    { id: "habits", label: "Habit Progression", value: "habits" },
    { id: "journal", label: "Journal Logs", value: "journal" },
    { id: "focus", label: "Focus stats", value: "focus" },
];

export default function IntelligencePage() {
    const [timeframe, setTimeframe] = useState("today");
    const [selectedTypes, setSelectedTypes] = useState<string[]>(["moods", "journal"]);
    const [report, setReport] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY; // fetch api from .env

    const toggleType = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const generateReport = async () => {
        if (selectedTypes.length === 0) return;
        setLoading(true);
        setReport(null);

        try {
            const res = await fetch("/api/intelligence/report", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ timeframe, types: selectedTypes }),
            });
            const data = await res.json();
            if (data.report) {
                setReport(data.report);
            } else {
                alert("NeyoAI interrupted.");
            }
        } catch (e) {
            console.error(e);
            alert("Error reaching High Command.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-mono selection:bg-primary/30 pb-20">
            <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-12">

                <header className="flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-primary uppercase text-[10px] tracking-widest transition-all group">
                        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Home
                    </Link>
                    <div className="text-right">
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-primary flex items-center gap-3">
                            NeyoAI <Cpu size={24} />
                        </h1>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    <aside className="space-y-8">
                        <section className="space-y-4">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground border-b border-border/10 pb-2">Analysis TimeLine</h3>
                            <div className="flex flex-col gap-2">
                                {TIME_OPTIONS.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setTimeframe(opt.value)}
                                        className={`text-left px-4 py-3 rounded-xl border text-[10px] uppercase font-bold transition-all ${timeframe === opt.value ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" : "bg-card border-border/50 text-muted-foreground hover:border-primary/50"
                                            }`}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground border-b border-border/10 pb-2">Data Type</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {DATA_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => toggleType(type.value)}
                                        className={`text-left px-4 py-3 rounded-xl border text-[10px] uppercase font-bold transition-all ${selectedTypes.includes(type.value) ? "border-primary text-primary bg-primary/5" : "bg-transparent border-border/50 text-muted-foreground/50 hover:border-border"
                                            }`}>
                                        [ {selectedTypes.includes(type.value) ? 'X' : ' '} ] {type.label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <button
                            onClick={generateReport}
                            disabled={loading || selectedTypes.length === 0}
                            className="w-full bg-primary disabled:opacity-30 text-primary-foreground py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                            {loading ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                            Generate Report
                        </button>
                    </aside>

                    <main className="md:col-span-2 relative group">
                        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full opacity-50" />
                        <div className="relative z-10 bg-card/50 border border-border/50 rounded-[2.5rem] p-8 md:p-10 min-h-[500px] shadow-3xl backdrop-blur-3xl overflow-hidden flex flex-col">

                            {!report && !loading && (
                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-20">
                                    <Shield size={60} strokeWidth={1} />
                                    <p className="text-[10px] uppercase tracking-[0.5em] max-w-[200px]">Waiting for summary...</p>
                                </div>
                            )}

                            {loading && (
                                <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse" />
                                        <Image src={logo} alt="" width={60} height={60} className="relative z-10 animate-spin-slow grayscale" />
                                    </div>
                                    <div className="space-y-2 text-center">
                                        <p className="text-[10px] uppercase tracking-[0.3em] animate-pulse">Loading User Data...</p>
                                        <p className="text-[8px] uppercase tracking-[0.3em] text-muted-foreground/30 animate-pulse">Almost there!</p>
                                    </div>
                                </div>
                            )}

                            {report && (
                                <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-4 opacity-50">
                                        <span className="text-[9px] uppercase tracking-widest text-primary font-bold">NeyoAI Report // {timeframe}</span>
                                        <TerminalIcon size={14} />
                                    </div>
                                    <div className="prose prose-invert max-w-none prose-sm font-sans
                                        prose-headings:text-primary prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter
                                        prose-strong:text-primary prose-strong:font-bold
                                        prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/5
                                        prose-table:border prose-table:border-white/10 prose-th:bg-white/5 prose-th:p-2 prose-td:p-2 prose-td:border-t prose-td:border-white/5
                                    ">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {report}
                                        </ReactMarkdown>
                                    </div>
                                    <div className="pt-8 border-t border-white/5 mt-auto">
                                    </div>
                                </div>
                            )}

                        </div>
                    </main>

                </div>

            </div>
        </div>
    );
}