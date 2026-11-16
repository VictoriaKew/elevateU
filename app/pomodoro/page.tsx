"use client";

import { useEffect, useState } from "react";
import { History, Pause, Play, RotateCcw, Timer } from "lucide-react";
import { Nav } from "@/components/nav";
import { createClient } from "@/lib/supabase/client";

const modes = {
  focus: { label: "Focus", minutes: 25, sessionType: "focus" },
  short: { label: "Short break", minutes: 5, sessionType: "short_break" },
  long: { label: "Long break", minutes: 15, sessionType: "long_break" },
} as const;
type Mode = keyof typeof modes;
type Session = { id: string; session_type: string; duration_minutes: number | null; ended_at: string | null };

function sessionLabel(type: string) {
  return type === "short_break" ? "Short break" : type === "long_break" ? "Long break" : "Focus session";
}

export default function Pomodoro() {
  const [mode, setMode] = useState<Mode>("focus");
  const [seconds, setSeconds] = useState(modes.focus.minutes * 60);
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<Session[]>([]);

  const totalSeconds = modes[mode].minutes * 60;
  const elapsedMinutes = Math.max(1, Math.round((totalSeconds - seconds) / 60));

  useEffect(() => {
    async function loadHistory() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("pomodoro_sessions").select("id,session_type,duration_minutes,ended_at").eq("user_id", user.id).eq("status", "completed").order("ended_at", { ascending: false }).limit(5);
      setHistory(data ?? []);
    }
    loadHistory();
  }, []);

  useEffect(() => {
    if (!running || seconds === 0) return;
    const timer = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, seconds]);

  useEffect(() => {
    if (seconds === 0 && !saved) saveSession();
    // Save only once when a full timer reaches zero.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  function selectMode(nextMode: Mode) {
    setMode(nextMode);
    setRunning(false);
    setSaved(false);
    setSeconds(modes[nextMode].minutes * 60);
  }

  function reset() {
    setRunning(false);
    setSaved(false);
    setSeconds(totalSeconds);
  }

  async function saveSession() {
    if (saved || totalSeconds === seconds) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { location.assign("/login"); return; }
    const { data, error } = await supabase.from("pomodoro_sessions").insert({ user_id: user.id, session_type: modes[mode].sessionType, duration_minutes: elapsedMinutes, ended_at: new Date().toISOString(), status: "completed" }).select("id,session_type,duration_minutes,ended_at").single();
    if (!error && data) {
      setSaved(true);
      setHistory((current) => [data, ...current].slice(0, 5));
    }
  }

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return <><Nav /><main className="mx-auto max-w-4xl px-5 py-14 text-center"><p className="eyebrow">Pomodoro Focus Timer</p><h1 className="mt-3 text-4xl font-black text-ink">Make space for deep work.</h1><p className="mt-3 text-slate-600">Choose a focus session or take a well-earned break.</p><section className="card mx-auto mt-10 max-w-xl p-7 sm:p-10"><div className="flex flex-wrap justify-center gap-2">{(Object.keys(modes) as Mode[]).map((item) => <button key={item} onClick={() => selectMode(item)} className={`rounded-full px-4 py-2 text-sm font-bold transition ${mode === item ? "bg-violet-700 text-white" : "bg-violet-50 text-violet-800 hover:bg-violet-100"}`}>{modes[item].label} - {modes[item].minutes} min</button>)}</div><Timer className="mx-auto mt-8 text-violet-700" size={38} /><div className="mt-7 text-7xl font-black tracking-tight text-ink">{mins}:{secs}</div><p className="mt-3 text-slate-500">{modes[mode].label} - {modes[mode].minutes} minutes</p><div className="mt-8 flex flex-wrap justify-center gap-3"><button onClick={() => setRunning((current) => !current)} disabled={seconds === 0} className="button-primary disabled:opacity-50">{running ? <Pause size={18} /> : <Play size={18} />}{running ? "Pause" : seconds === 0 ? "Complete" : `Start ${modes[mode].label.toLowerCase()}`}</button><button onClick={reset} className="button-secondary"><RotateCcw size={18} />Reset</button><button onClick={saveSession} disabled={saved || seconds === totalSeconds} className="button-secondary disabled:cursor-not-allowed disabled:opacity-50">{saved ? "Saved" : "Save session"}</button></div>{saved && <p className="mt-5 text-sm font-bold text-emerald-600">Session saved to your history.</p>}{seconds === 0 && <p className="mt-3 text-sm font-bold text-violet-700">Nice work - your {modes[mode].label.toLowerCase()} is complete.</p>}</section><section className="mx-auto mt-10 max-w-xl text-left"><div className="flex items-center gap-2"><History className="text-violet-700" size={20} /><h2 className="text-xl font-black text-ink">Your last 5 sessions</h2></div>{history.length ? <div className="mt-4 space-y-3">{history.map((session) => <article key={session.id} className="card flex items-center justify-between gap-4 p-4"><div><p className="font-bold text-ink">{sessionLabel(session.session_type)}</p><p className="mt-1 text-sm text-slate-500">{session.ended_at ? new Date(session.ended_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Saved session"}</p></div><span className="rounded-full bg-violet-50 px-3 py-1 text-sm font-bold text-violet-800">{session.duration_minutes ?? 0} min</span></article>)}</div> : <p className="mt-4 text-slate-600">Your completed sessions will appear here.</p>}</section></main></>;
}
