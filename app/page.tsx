"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown, Compass, Heart, HeartHandshake, Map, MessageCircleQuestion, Sparkles, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { Nav } from "@/components/nav";
import { createClient } from "@/lib/supabase/client";

const features = [
  [Compass, "Career Match", "Explore technology career paths through a guided questionnaire.", "/assessment", "Start Career Match"],
  [Sparkles, "Adaptive Learning Roadmap", "Turn career exploration into practical learning steps.", "/roadmap", "Open Roadmap"],
  [Target, "Pomodoro Focus Timer", "Build an intentional rhythm with focused work and breaks.", "/pomodoro", "Start focus timer"],
] as const;

const faqs = [
  [MessageCircleQuestion, "What is ElevateU?", "It is a friendly space to explore career ideas, build useful skills and find a study routine that works for you."],
  [Compass, "How does Career Match work?", "Answer a few simple questions about what interests you, and we will suggest technology paths you might enjoy exploring."],
  [HeartHandshake, "Do I have to follow my Career Match result?", "No. It is a helpful starting point, and your interests can change as you discover more."],
  [Map, "What will I find in the Learning Roadmap?", "You will find practical skills to try, project ideas to make and learning resources to help you move forward."],
  [Heart, "Why is wellness part of ElevateU?", "Your goals matter, and so does your wellbeing. Planned breaks can help you study with more balance and less pressure."],
] as const;

function firstName(fullName: string, email: string) {
  const name = fullName.trim() || email.split("@")[0]?.replace(/[._-]+/g, " ") || "there";
  return name.split(/\s+/)[0];
}

export default function Page() {
  const [name, setName] = useState("");
  const [nextStep, setNextStep] = useState<{ status: "loading" | "new" | "ready" | "error"; career?: string; recommended?: string; completed?: number; total?: number }>({ status: "loading" });
  useEffect(() => { async function load() {
    const supabase = createClient(); const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user) { setNextStep({ status: authError && authError.name !== "AuthSessionMissingError" ? "error" : "new" }); return; }
    const metadata = user.user_metadata ?? {}; setName(firstName(String(metadata.full_name ?? metadata.name ?? metadata.given_name ?? ""), user.email ?? ""));
    const { data: result, error } = await supabase.from("assessment_results").select("active_career,recommended_career").eq("user_id", user.id).maybeSingle();
    if (error) { setNextStep({ status: "error" }); return; }
    const career = result?.active_career ?? result?.recommended_career;
    if (!career) { setNextStep({ status: "new" }); return; }
    const [resourceResult, progressResult] = await Promise.all([supabase.from("roadmap_resources").select("id").eq("career_track", career), supabase.from("roadmap_progress").select("resource_id").eq("user_id", user.id).eq("status", "completed")]);
    if (resourceResult.error || progressResult.error) { setNextStep({ status: "ready", career, recommended: result?.recommended_career }); return; }
    const completedIds = new Set((progressResult.data ?? []).map((item) => item.resource_id)); const resources = resourceResult.data ?? [];
    setNextStep({ status: "ready", career, recommended: result?.recommended_career, total: resources.length, completed: resources.filter((item) => completedIds.has(item.id)).length });
  } void load(); }, []);
  const displayName = name || "there";
  const heading = `Ready for your next step, ${displayName}?`;

  return <><Nav /><main className="page-shell"><section className="px-5 pb-12 pt-10 sm:pb-16 sm:pt-14"><div className="hero-glass mx-auto max-w-6xl px-6 py-14 text-center sm:px-10 sm:py-20"><p className="eyebrow">WELCOME TO ELEVATEU</p><h1 className="hero-title mt-4">{heading}</h1><p className="mx-auto mt-5 max-w-xl leading-7 text-slate-600">Wherever you are in your journey, there&apos;s a next step you can take at your own pace.</p><NextStepCard step={nextStep} /></div></section>
    <section id="begin" className="page-content scroll-mt-20"><div className="grid items-center gap-12 lg:grid-cols-2"><div><p className="eyebrow">YOUR TECH CAREER COMPANION</p><h2 className="page-title">Elevate your career.<br /><span className="text-violet-700">Shape your future.</span></h2><p className="page-lede">Discover career possibilities, develop practical skills and create a healthier rhythm for learning - all with ElevateU.</p><div className="mt-8 flex flex-wrap gap-3"><a href="#features" className="button-primary">Explore ElevateU <ArrowRight size={17} /></a><Link href="/careers" className="button-secondary">Explore All Careers <Compass size={17} /></Link></div></div><div className="rounded-[32px] bg-gradient-to-br from-violet-600 to-violet-900 p-7 text-white shadow-xl shadow-violet-200/30"><p className="text-xs font-black tracking-[.18em] text-violet-200">YOUR GROWTH JOURNEY</p><h3 className="mt-2 text-2xl font-black">One step at a time.</h3>{[[Compass, "Discover your direction"], [Sparkles, "Build your skills"], [Heart, "Find your balance"]].map(([Icon, label], index) => { const StepIcon = Icon as typeof Compass; return <div className="mt-4 flex items-center gap-4 rounded-2xl bg-white/10 p-4" key={String(label)}><StepIcon /><b>{String(label)}</b><span className="ml-auto text-violet-200">0{index + 1}</span></div>; })}</div></div></section>
    <section id="features" className="page-content pt-0"><p className="eyebrow text-center">EXPLORE ELEVATEU</p><h2 className="page-title text-center">Three ways to move forward</h2><div className="mt-10 grid gap-6 md:grid-cols-3">{features.map(([Icon, title, text, href, cta]) => <article key={title} className="card flex flex-col p-8 transition hover:-translate-y-1 hover:shadow-lg"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-100 text-violet-700"><Icon size={25} /></span><h3 className="mt-8 text-xl font-black text-ink">{title}</h3><p className="mt-4 min-h-14 leading-7 text-slate-600">{text}</p><Link href={href} className="button-primary mt-7 w-full rounded-xl px-4 py-3">{cta}<ArrowRight size={16} /></Link></article>)}</div></section>
    <section className="px-5 pb-14"><div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-r from-violet-700 to-violet-900 p-8 text-white sm:p-10"><p className="text-xs font-black tracking-[.18em] text-violet-200">STUDY WITH BALANCE</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">Progress matters. So does taking a break.</h2><p className="mt-4 max-w-2xl leading-7 text-violet-100">Learning is a journey, not a race. Make time for focused work, take planned breaks and give yourself room to recharge.</p><Link href="/wellness" className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/25">Explore wellness <ArrowRight size={16} /></Link></div></section>
    <section className="page-content pt-10"><div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr]"><div><p className="eyebrow">FAQS</p><h2 className="page-title">Questions?<br />We&apos;ve got you.</h2></div><div className="space-y-3">{faqs.map(([Icon, question, answer]) => <details key={question} className="card group p-5"><summary className="flex cursor-pointer list-none items-center gap-3 font-bold text-ink [&::-webkit-details-marker]:hidden"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700"><Icon size={19} /></span><span>{question}</span><ChevronDown className="ml-auto shrink-0 text-violet-500 transition group-open:rotate-180" size={20} /></summary><p className="ml-12 mt-4 leading-7 text-slate-600">{answer}</p></details>)}</div></div></section>
  </main></>;
}

function NextStepCard({ step }: { step: { status: "loading" | "new" | "ready" | "error"; career?: string; recommended?: string; completed?: number; total?: number } }) {
  if (step.status === "loading") return <p role="status" className="mt-8 text-sm text-slate-600">Finding your next step...</p>;
  if (step.status === "error") return <div className="mt-8"><p className="text-sm text-slate-600">We couldn&apos;t load your progress just now. You can still explore your roadmap.</p><Link href="/roadmap" className="button-primary mt-4">Open roadmap <ArrowRight size={16} /></Link></div>;
  if (step.status === "new") return <div className="mt-8"><Link href="/assessment" className="button-primary">Discover your career path <ArrowRight size={16} /></Link><p className="mt-3 text-sm text-slate-600">A short assessment is a great place to begin.</p></div>;
  const hasProgress = step.total !== undefined && step.completed !== undefined;
  const percent = hasProgress && step.total ? Math.round(step.completed! / step.total * 100) : 0;
  return <div className="card mx-auto mt-8 max-w-xl p-6 text-left"><p className="eyebrow">YOUR ACTIVE PATHWAY</p><h2 className="mt-2 text-xl font-black text-ink">{step.career}</h2>{step.recommended && step.recommended !== step.career && <p className="mt-2 text-sm text-slate-600">Latest assessment recommendation: <strong>{step.recommended}</strong></p>}{hasProgress && step.total! > 0 ? <><p className="mt-4 text-sm font-semibold text-slate-600">{step.completed} of {step.total} resources complete</p><div role="progressbar" aria-label={`${step.career} roadmap progress`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} className="mt-2 h-2 overflow-hidden rounded-full bg-violet-200"><div className="h-full rounded-full bg-violet-700" style={{ width: `${percent}%` }} /></div></> : <p className="mt-3 text-sm text-slate-600">{hasProgress ? "Your pathway resources will appear as they become available." : "Your progress is temporarily unavailable. You can still open your roadmap."}</p>}<Link href="/roadmap" className="button-primary mt-5">Continue your roadmap <ArrowRight size={16} /></Link></div>;
}
