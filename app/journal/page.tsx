"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "../logo.png";
import { ChevronLeft, Trash2, Hash, Sparkles, Send } from "lucide-react";
import Link from "next/link";

type Entry = { id: string; content: string; tags: string[]; createdAt: string };

export default function JournalPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY; // get key from .env

  const fetchJournal = async () => {
    const res = await fetch("/api/journal", {
      headers: { "Authorization": `Bearer ${API_KEY}` },
      cache: 'no-store'
    });
    const data = await res.json();
    setEntries(Array.isArray(data) ? data.reverse() : []);
    setLoading(false);
  };

  useEffect(() => { fetchJournal(); }, []);

  const saveEntry = async () => {
    if (!content.trim()) return;
    const tags = tagInput.split(",").map(t => t.trim()).filter(t => t);

    await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
      body: JSON.stringify({ content, tags }),
    });

    setContent("");
    setTagInput("");
    fetchJournal();
  };

  const deleteEntry = async (id: string) => {
    const originalEntries = [...entries];
    setEntries(prev => prev.filter(e => e.id !== id));

    try {
      const res = await fetch(`/api/journal/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${API_KEY}` },
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }
    } catch (err) {
      console.error("Deletion failed:", err);
      alert("System Error: Could not delete entry. Reverting UI...");
      setEntries(originalEntries);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-muted-foreground gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse" />
          <Image src={logo} alt="NeyoOS" width={60} height={60} className="relative z-10 opacity-50 animate-pulse grayscale" />
        </div>
        <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-muted-foreground/30 animate-pulse border-t border-border/10 pt-4">Opening Journal</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 pb-20">
      <div className="max-w-3xl mx-auto p-6 md:p-12 space-y-16">

        <header className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-primary uppercase font-mono text-[10px] tracking-widest transition-colors">
            <ChevronLeft size={14} /> Home
          </Link>
          <div className="text-right">
            <h1 className="text-3xl font-black italic tracking-tighter uppercase">Journal</h1>
          </div>
        </header>

        <section className="bg-card border border-border/50 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles size={18} />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">New Journal</span>
            </div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What's the status of your mind currently?"
              className="w-full bg-transparent border-none text-xl md:text-2xl font-serif italic text-foreground placeholder:opacity-20 focus:ring-0 resize-none min-h-[120px] leading-relaxed" />
            <div className="flex flex-col md:flex-row gap-4 justify-between border-t border-border/20 pt-6 mt-4">
              <div className="flex items-center gap-3 bg-secondary/30 px-4 py-2 rounded-xl border border-border/30 w-full md:w-auto">
                <Hash size={14} className="text-muted-foreground" />
                <input
                  placeholder="tags (#birthday)"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-xs font-mono w-full"
                />
              </div>
              <button
                onClick={saveEntry}
                disabled={!content.trim()}
                className="bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                Create <Send size={14} />
              </button>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-primary/5 rounded-full blur-[100px] group-hover:bg-primary/10 transition-colors" />
        </section>

        <div className="space-y-12">
          <div className="flex items-center gap-4 opacity-30">
            <div className="h-[1px] w-full bg-border" />
            <h2 className="text-[9px] font-mono uppercase tracking-[0.4em] whitespace-nowrap">Recent Journals</h2>
            <div className="h-[1px] w-full bg-border" />
          </div>

          <div className="space-y-10">
            {entries.map(entry => (
              <article key={entry.id} className="group relative pl-8 border-l border-border/40 hover:border-primary transition-colors">
                <div className="absolute -left-[5px] top-0 w-[9px] h-[9px] bg-background border border-border group-hover:border-primary group-hover:bg-primary transition-all rounded-full" />

                <header className="flex items-center justify-between mb-4">
                  <time className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                    {new Date(entry.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </time>
                  <button onClick={() => deleteEntry(entry.id)} className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                    <Trash2 size={14} />
                  </button>
                </header>

                <p className="text-lg leading-relaxed text-foreground opacity-90 font-serif italic mb-6">
                  "{entry.content}"
                </p>

                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map(tag => (
                      <span key={tag} className="text-[9px] font-mono uppercase tracking-tighter bg-secondary/50 px-2 py-0.5 rounded border border-border text-muted-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
            {entries.length === 0 && (
              <p className="text-center text-muted-foreground font-mono text-xs italic py-12">The journals archive is currently empty.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}