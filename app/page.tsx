"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { Lock, ShieldCheck, Loader2, Shield } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password}),
      headers: { "Content-Type": "application/json"},
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      setMsg("access denied: invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 font-mono">
      <div className="max-w-md w-full space-y-8 border border-white/10 p-10 rounded-[2rem] bg-zinc-950 shadow-2xl relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="text-center space-y-2 relative z-10">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5">
          <Lock className="text-blue-500 w-8 h-8" />
          </div>
        </div>
        <h1 className="text-2xl font-black tracking-tighter uppercase italic">Login to NeyoOS</h1>
      </div>

      <form onSubmit={handleLogin} className="space-y-4 relative z-10">
        <div className="space-y-3">
          <input type="text" placeholder="IDENTITY" required className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 px-6 text-xs tracking-widest focus:border-blue-500 transition-all placeholder:opacity-20 outline-none"
          value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" required
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 px-6 text-xs tracking-widest focus:border-blue-500 transition-all placeholder:opacity-20 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)} />
        </div>

        {msg && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-wider">{msg}</p>}

  <button type="submit" disabled={loading as boolean}
    className="w-full bg-white text-black py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-2 mt-4" 
  >
    {loading ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
    Login
  </button>
      </form>
      <div className="text center pt-8 opacity-20 border-white/5 mx-auto">
      <p className="text-[px] uppercase tracking-widest">encrypted-tunnel: active</p>
      </div>
    </div>
    </div>
  )
}