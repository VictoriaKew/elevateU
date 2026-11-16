"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  async function signInWithGoogle() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) { alert("Supabase has not been configured yet."); return; }
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` }
    });
    if (error) alert(error.message);
  }

  return <main className="grid min-h-screen bg-[#fcfaff] lg:grid-cols-2">
    <section className="relative hidden overflow-hidden bg-gradient-to-br from-violet-950 via-violet-800 to-indigo-900 p-12 text-white lg:flex lg:flex-col">
      <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-fuchsia-500/25 blur-3xl"/><div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-sky-400/15 blur-3xl"/>
      <Link href="/" className="relative flex items-center gap-2.5 text-2xl font-extrabold"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15"><Sparkles size={20}/></span>ElevateU</Link>
      <div className="relative my-auto max-w-md"><p className="text-xs font-extrabold tracking-[.2em] text-violet-200">YOUR JOURNEY, ELEVATED</p><h1 className="mt-5 text-5xl font-black leading-tight">A clearer path<br/>starts here.</h1><p className="mt-6 text-lg leading-8 text-violet-100">Discover your direction, build practical skills and find a healthier learning rhythm.</p><div className="mt-10 space-y-4">{[[GraduationCap,"Career direction","Explore technology paths that fit your interests."],[CheckCircle2,"Learning roadmap","Turn your next goal into clear, manageable steps."],[ShieldCheck,"Private by design","Your progress belongs to you."]].map(([Icon,title,text])=>{const C=Icon as typeof Sparkles;return <div className="flex gap-4" key={String(title)}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10"><C size={20}/></span><span><b className="block">{String(title)}</b><small className="text-violet-200">{String(text)}</small></span></div>})}</div></div><p className="relative text-sm text-violet-200">Discover · Develop · Thrive</p>
    </section>
    <section className="flex items-center justify-center p-5 sm:p-10"><div className="w-full max-w-md"><Link href="/" className="mb-12 inline-flex items-center gap-2 text-sm font-bold text-violet-700 lg:hidden"><ArrowLeft size={16}/> Back to ElevateU</Link><div className="mb-8 lg:hidden"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-700 text-white"><Sparkles size={21}/></span></div><p className="eyebrow">Welcome to ElevateU</p><h2 className="mt-3 text-4xl font-black tracking-tight text-ink">Ready to grow?</h2><p className="mt-3 leading-7 text-slate-600">Sign in to save your assessment, learning progress and focus sessions.</p><button onClick={signInWithGoogle} className="mt-9 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"><span className="grid h-6 w-6 place-items-center rounded-full bg-white text-lg font-black text-[#4285F4]">G</span> Continue with Google <ArrowRight className="ml-1 text-violet-600" size={17}/></button><p className="mt-6 text-center text-xs leading-5 text-slate-500">By continuing, you agree to use ElevateU as a personal learning and wellbeing companion.</p><div className="my-9 h-px bg-slate-200"/><p className="text-center text-sm text-slate-600">New here? <Link className="font-bold text-violet-700" href="/">Learn how ElevateU works</Link></p></div></section>
  </main>;
}
