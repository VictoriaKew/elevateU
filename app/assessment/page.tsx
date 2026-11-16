"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Heart, Sparkles } from "lucide-react";
import { Nav } from "@/components/nav";
import { createClient } from "@/lib/supabase/client";

type Option = { id: string; option_text: string; career_track: string | null; wellness_score: number | null; sort_order: number };
type Question = { id: string; question_key: string; prompt: string; category: "career" | "wellness"; sort_order: number; assessment_options: Option[] };
type ExistingResult = { career: string; wellness: string };

function riskFromScore(score: number) { return score >= 4 ? "High" : score >= 2 ? "Mid" : "Low"; }

export default function Assessment() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ExistingResult | null>(null);
  const [previousResult, setPreviousResult] = useState<ExistingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showRestartWarning, setShowRestartWarning] = useState(false);
  const complete = questions.length > 0 && questions.every((question) => Boolean(answers[question.id]));

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { location.assign("/login"); return; }
      const [{ data: savedResult }, { data: questionData }] = await Promise.all([
        supabase.from("assessment_results").select("recommended_career,wellness_risk").eq("user_id", user.id).maybeSingle(),
        supabase.from("assessment_questions").select("id,question_key,prompt,category,sort_order,assessment_options(id,option_text,career_track,wellness_score,sort_order)").order("sort_order"),
      ]);
      if (savedResult?.recommended_career) setPreviousResult({ career: savedResult.recommended_career, wellness: savedResult.wellness_risk ?? "Low" });
      const prepared = ((questionData ?? []) as Question[]).map((question) => ({ ...question, assessment_options: [...(question.assessment_options ?? [])].sort((a, b) => a.sort_order - b.sort_order) }));
      setQuestions(prepared);
      setLoading(false);
    }
    load();
  }, []);

  async function confirmRestart() {
    const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await Promise.all([supabase.from("roadmap_progress").delete().eq("user_id", user.id), supabase.from("assessment_results").delete().eq("user_id", user.id)]);
    setPreviousResult(null); setShowRestartWarning(false); setAnswers({});
  }

  async function finish() {
    if (!complete) return;
    setSaving(true);
    const selected = questions.map((question) => ({ question, option: question.assessment_options.find((option) => option.id === answers[question.id]) })).filter((item): item is { question: Question; option: Option } => Boolean(item.option));
    const scores: Record<string, number> = {};
    selected.filter((item) => item.question.category === "career").forEach(({ option }) => { if (option.career_track) scores[option.career_track] = (scores[option.career_track] ?? 0) + 1; });
    const career = Object.entries(scores).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "Career Explorer";
    const wellness = riskFromScore(selected.filter((item) => item.question.category === "wellness").reduce((total, item) => total + (item.option.wellness_score ?? 0), 0));
    const savedAnswers = Object.fromEntries(selected.map(({ question, option }) => [question.question_key, { prompt: question.prompt, answer: option.option_text }]));
    const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser();
    if (user) { await supabase.from("assessment_submissions").insert({ user_id: user.id, answers: savedAnswers }); await supabase.from("assessment_results").upsert({ user_id: user.id, scores, recommended_career: career, wellness_risk: wellness, scoring_version: "supabase-content-v1" }); }
    setResult({ career, wellness }); setSaving(false);
  }

  if (loading) return <><Nav /><main className="page-shell"><div className="page-content"><p className="text-slate-600">Loading Career Match...</p></div></main></>;
  if (previousResult && !result) return <><Nav /><main className="page-shell"><div className="page-content max-w-3xl"><section className="card p-8 text-center"><CheckCircle2 className="mx-auto text-violet-700" size={42} /><p className="eyebrow mt-5">Career Match complete</p><h1 className="page-title">You have already completed Career Match.</h1><p className="mx-auto mt-4 max-w-lg leading-7 text-slate-600">Your current direction is <strong>{previousResult.career}</strong>. Continue to your learning roadmap to keep building your progress.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><a href="/roadmap" className="button-primary">Go to learning roadmap <ArrowRight size={17} /></a><button onClick={() => setShowRestartWarning(true)} className="button-secondary">Take the test again</button></div></section>{showRestartWarning && <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-5"><div className="card w-full max-w-md p-7"><h2 className="text-2xl font-black text-ink">Start a new Career Match?</h2><p className="mt-3 leading-7 text-slate-600">Your current career result and learning-roadmap progress will be cleared. This cannot be undone.</p><div className="mt-7 flex flex-wrap justify-end gap-3"><button onClick={() => setShowRestartWarning(false)} className="button-secondary">No, keep my progress</button><button onClick={confirmRestart} className="button-primary">Confirm and start again</button></div></div></div>}</div></main></>;
  if (result) return <><Nav /><main className="page-shell"><div className="page-content max-w-3xl"><section className="card p-8 text-center"><CheckCircle2 className="mx-auto text-violet-700" size={42} /><p className="eyebrow mt-5">Your starting point</p><h1 className="page-title">{result.career}</h1><p className="mx-auto mt-4 max-w-lg leading-7 text-slate-600">This is a direction to explore, not a final decision. Your learning roadmap is ready, and we have also selected {result.wellness.toLowerCase()}-support resources for your study rhythm.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><a href="/roadmap" className="button-primary">View my roadmap <ArrowRight size={17} /></a><a href="/wellness" className="button-secondary">Visit wellness resources <Heart size={17} /></a></div></section></div></main></>;

  const careerQuestions = questions.filter((question) => question.category === "career");
  const wellnessQuestions = questions.filter((question) => question.category === "wellness");
  return <><Nav /><main className="page-shell"><div className="page-content max-w-3xl"><p className="eyebrow">Career Match</p><h1 className="page-title">Discover a direction that fits you.</h1><p className="page-lede">There are no right answers here. Choose what feels most like you today, and we will suggest a path to explore.</p><div className="mt-9 space-y-5">{careerQuestions.map((question, index) => <QuestionCard key={question.id} question={question} number={index + 1} selectedId={answers[question.id]} onSelect={(optionId) => setAnswers((current) => ({ ...current, [question.id]: optionId }))} />)}</div><section className="card mt-5 p-6"><div className="flex items-center gap-3"><span className="rounded-xl bg-violet-100 p-2 text-violet-700"><Heart size={20} /></span><div><p className="font-bold text-ink">A quick wellbeing check-in</p><p className="text-sm text-slate-600">This helps us show useful support resources. It is not a diagnosis.</p></div></div><div className="mt-6 grid gap-6">{wellnessQuestions.map((question) => <QuestionCard key={question.id} question={question} selectedId={answers[question.id]} onSelect={(optionId) => setAnswers((current) => ({ ...current, [question.id]: optionId }))} />)}</div></section>{questions.length === 0 && <p className="mt-8 text-slate-600">Career Match questions have not been added to Supabase yet.</p>}<button disabled={!complete || saving} onClick={finish} className="button-primary mt-6 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving your result..." : <>See my result <Sparkles size={17} /></>}</button></div></main></>;
}

function QuestionCard({ question, number, selectedId, onSelect }: { question: Question; number?: number; selectedId?: string; onSelect: (id: string) => void }) {
  return <section className="card p-6"><p className="font-bold text-ink">{number ? `${number}. ` : ""}{question.prompt}</p><div className="mt-4 grid gap-2">{question.assessment_options.map((option) => <button onClick={() => onSelect(option.id)} key={option.id} className={`rounded-xl border p-3 text-left text-sm transition ${selectedId === option.id ? "border-violet-600 bg-violet-50 text-violet-800" : "hover:bg-violet-50"}`}>{option.option_text}</button>)}</div></section>;
}
