"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import logo from "../logo.png";
import { ChevronLeft, Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import Link from "next/link";

const MODES = {
  WORK: { label: "Deep Work", seconds: 30 * 60, type: "work", color: "text-primary" },
  SHORT: { label: "Short Break", seconds: 5 * 60, type: "short_break", color: "text-blue-400" },
  LONG: { label: "Long Break", seconds: 15 * 60, type: "long_break", color: "text-purple-400" },
  CUSTOM: { label: "Custom", seconds: 0, type: "custom", color: "text-orange-400" },
};

export default function FocusPage() {
  const [mode, setMode] = useState(MODES.WORK);
  const [timeLeft, setTimeLeft] = useState(mode.seconds);
  const [isActive, setIsActive] = useState(false);
  const [sessionsToday, setSessionsToday] = useState(0);
  const [customMinutes, setCustomMinutes] = useState("");
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY; // get api from .env

  const fetchSessionCount = useCallback(async () => {
    try {
      const res = await fetch("/api/focus", { headers: { "Authorization": `Bearer ${API_KEY}` } });
      const data = await res.json();
      setSessionsToday(Array.isArray(data) ? data.filter((s: any) => s.type === 'work').length : 0);
    } catch (e) {
      console.error(e);
    }
  }, [API_KEY]);

  useEffect(() => { fetchSessionCount(); }, [fetchSessionCount]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleComplete = async () => {
    setIsActive(false);
    new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3").play().catch(() => { });

    if (mode.type === "work" || mode.type === "custom") {
      await fetch("/api/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}`},
        body: JSON.stringify({ type: mode.type, duration: mode.seconds}),
      });
      fetchSessionCount();
    }
    alert(`${mode.label} Finished!`);
  };

  const switchMode = (newMode: typeof MODES.WORK) => {
    setIsActive(false);
    setMode(newMode);
    if (newMode.type !== "custom") {
      setTimeLeft(newMode.seconds);
    } else {
      setTimeLeft(0);
      setCustomMinutes("");
    }
  };

  const applyCustomTime = () => {
    const mins = parseInt(customMinutes);
    if (isNaN(mins) || mins <= 0) return;
    setTimeLeft(mins * 60);
    setMode({ ...MODES.CUSTOM, seconds: mins * 60});
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <div className="max-w-4xl mx-auto p-6 md:p-12 flex flex-col items-center justify-center min-h-screen space-y-12">

        <div className="w-full flex items-center justify-between absolute top-12 px-6 md:px-12 left-0">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-primary uppercase text-[10px] tracking-widest transition-all">
            <ChevronLeft size={14} /> Home
          </Link>
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] opacity-40">
            <span className="hidden md:inline">Sessions Today</span>
            <span className="text-primary font-black text-xs md:text-sm">{sessionsToday}</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex bg-card/50 border border-white/5 p-1.5 rounded-[2rem] shadow-input backdrop-blur-xl overflow-x-auto w-full md:w-auto justify-center">
            {Object.values(MODES).map((m) => (
              <button
                key={m.type}
                onClick={() => switchMode(m)}
                className={`px-4 md:px-6 py-2.5 rounded-2xl text-[10px] uppercase tracking-widest transition-all font-bold whitespace-nowrap ${mode.type === m.type ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                  }`}>
                {m.label}
              </button>
            ))}
          </div>

          {mode.type === "custom" && !isActive && (
            <div className="flex items-center gap-2 bg-card border border-border p-2 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <input
                type="number"
                placeholder="Minutes"
                value={customMinutes}
                onChange={e => setCustomMinutes(e.target.value)}
                className="bg-transparent border-none text-xs w-20 px-3 focus:ring-0"/>
              <button
                onClick={applyCustomTime}
                className="bg-primary text-primary-foreground text-[9px] uppercase font-black px-4 py-2 rounded-xl">
                Set Timer
              </button>
            </div>
          )}
        </div>

        <div className="relative group">
          <div className={`absolute inset-0 blur-[80px] md:blur-[100px] rounded-full transition-all duration-1000 ${isActive ? 'bg-primary/20 scale-125 opacity-100' : 'bg-primary/5 scale-100 opacity-50'}`} />
          <div className="relative z-10 w-72 h-72 md:w-[28rem] md:h-[28rem] rounded-full border border-white/5 bg-card/20 flex flex-col items-center justify-center shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-3xl overflow-hidden">
            <div className="absolute top-1/4 opacity-10">
              <Image src={logo} alt="" width={60} height={60} className={isActive ? 'animate-spin-slow grayscale' : 'grayscale'} />
            </div>
            <h2 className={`text-7xl md:text-[10rem] font-black tracking-tighter tabular-nums ${mode.color} transition-colors duration-500`}>
              {formatTime(timeLeft)}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-6 md:gap-8 translate-y-4">
          <button
            onClick={() => { setTimeLeft(mode.seconds); setIsActive(false); }}
            className="p-4 rounded-full border border-border/50 hover:bg-card transition-all text-muted-foreground hover:text-foreground">
            <RotateCcw size={20} />
          </button>

          <button
            onClick={() => {
              if (timeLeft > 0) setIsActive(!isActive);
            }}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="translate-x-1" />}
          </button>

          <button
            onClick={handleComplete}
            className="p-4 rounded-full border border-border/50 hover:bg-card transition-all text-muted-foreground hover:text-foreground">
            <SkipForward size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}