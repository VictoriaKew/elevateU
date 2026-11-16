"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Heart, Sparkles } from "lucide-react";
import { Nav } from "@/components/nav";
import { createClient } from "@/lib/supabase/client";

type Career = "Frontend Developer" | "Backend Developer" | "UI/UX Designer" | "Data Analyst" | "DevOps Engineer" | "AI/ML Engineer";
type CareerQuestion = { question: string; options: { label: string; career: Career }[] };

const careerQuestions: CareerQuestion[] = [
  { question: "When building a new software product, what excites you most?", options: [
    { label: "Crafting the visuals and interactions people use", career: "Frontend Developer" }, { label: "Designing the database, APIs and core logic", career: "Backend Developer" }, { label: "Planning a clear and enjoyable user experience", career: "UI/UX Designer" }, { label: "Finding useful trends in the data", career: "Data Analyst" }, { label: "Automating deployments and cloud infrastructure", career: "DevOps Engineer" }, { label: "Training models to make helpful predictions", career: "AI/ML Engineer" },
  ] },
  { question: "You receive a huge e-commerce dataset. What would you do first?", options: [
    { label: "Clean it and build a dashboard to spot trends", career: "Data Analyst" }, { label: "Build a recommendation engine from it", career: "AI/ML Engineer" }, { label: "Design an interactive chart people can explore", career: "Frontend Developer" }, { label: "Store and query it efficiently in a database", career: "Backend Developer" }, { label: "Make sure the database can scale reliably", career: "DevOps Engineer" }, { label: "Plan the clearest way to present its story", career: "UI/UX Designer" },
  ] },
  { question: "How do you like to solve a complex technical problem?", options: [
    { label: "Experiment with the interface until it feels right", career: "Frontend Developer" }, { label: "Write clean, modular code and optimise the logic", career: "Backend Developer" }, { label: "Research users and prototype a better flow", career: "UI/UX Designer" }, { label: "Analyse evidence and visualise the outcome", career: "Data Analyst" }, { label: "Use mathematical models to find hidden patterns", career: "AI/ML Engineer" }, { label: "Automate repetitive tasks and deployments", career: "DevOps Engineer" },
  ] },
  { question: "An app crashes during a traffic spike. Which role sounds most like you?", options: [
    { label: "Investigate server logs and database performance", career: "Backend Developer" }, { label: "Tune infrastructure and auto-scaling", career: "DevOps Engineer" }, { label: "Design a reassuring recovery experience for users", career: "UI/UX Designer" }, { label: "Make sure the interface handles the error gracefully", career: "Frontend Developer" }, { label: "Analyse traffic patterns to find the cause", career: "Data Analyst" }, { label: "Build a model to predict future spikes", career: "AI/ML Engineer" },
  ] },
  { question: "Which tools would you be happiest to learn?", options: [
    { label: "React, TypeScript and Tailwind CSS", career: "Frontend Developer" }, { label: "Java, Node.js, PostgreSQL and APIs", career: "Backend Developer" }, { label: "Figma, user testing and design systems", career: "UI/UX Designer" }, { label: "SQL, Excel, Tableau and Power BI", career: "Data Analyst" }, { label: "AWS, Docker, Kubernetes and Linux", career: "DevOps Engineer" }, { label: "Python, TensorFlow and PyTorch", career: "AI/ML Engineer" },
  ] },
];

const breakOptions = ["I keep going until I am exhausted", "I take breaks, but they are unplanned", "I use a timer or set schedule", "I stop when I feel tired"];
const burnoutOptions = ["Almost daily", "A few times a week", "Mostly before deadlines or exams", "Rarely", "Never"];

function wellnessRisk(breakHabit: string, burnoutFrequency: string) {
  const breakScore = breakHabit === breakOptions[0] ? 2 : breakHabit === breakOptions[1] ? 1 : 0;
  const burnoutScore = burnoutFrequency === burnoutOptions[0] ? 3 : burnoutFrequency === burnoutOptions[1] ? 2 : burnoutFrequency === burnoutOptions[2] ? 1 : 0;
  const score = breakScore + burnoutScore;
  return score >= 4 ? "High" : score >= 2 ? "Mid" : "Low";
}

export default function Assessment() {
  const [answers, setAnswers] = useState<string[]>([]);
  const [breakHabit, setBreakHabit] = useState("");
  const [burnoutFrequency, setBurnoutFrequency] = useState("");
  const [result, setResult] = useState<{ career: Career; wellness: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [previousResult, setPreviousResult] = useState<{ career: string; wellness: string } | null>(null);
  const [checkingPreviousResult, setCheckingPreviousResult] = useState(true);
  const [showRestartWarning, setShowRestartWarning] = useState(false);
  const complete = answers.length === careerQuestions.length && Boolean(breakHabit) && Boolean(burnoutFrequency);

  useEffect(() => {
    async function loadPreviousResult() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { location.assign("/login"); return; }
      const { data } = await supabase.from("assessment_results").select("recommended_career,wellness_risk").eq("user_id", user.id).maybeSingle();
      if (data?.recommended_career) setPreviousResult({ career: data.recommended_career, wellness: data.wellness_risk ?? "Low" });
      setCheckingPreviousResult(false);
    }
    loadPreviousResult();
  }, []);

  async function confirmRestart() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { location.assign("/login"); return; }
    await Promise.all([
      supabase.from("roadmap_progress").delete().eq("user_id", user.id),
      supabase.from("assessment_results").delete().eq("user_id", user.id),
    ]);
    setPreviousResult(null);
    setShowRestartWarning(false);
    setAnswers([]);
    setBreakHabit("");
    setBurnoutFrequency("");
  }

  async function finish() {
    if (!complete) return;
    setSaving(true);
    const scores: Record<Career, number> = { "Frontend Developer": 0, "Backend Developer": 0, "UI/UX Designer": 0, "Data Analyst": 0, "DevOps Engineer": 0, "AI/ML Engineer": 0 };
    careerQuestions.forEach((question, index) => {
      const selected = question.options.find((option) => option.label === answers[index]);
      if (selected) scores[selected.career] += 1;
    });
    const career = (Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0]) as Career;
    const wellness = wellnessRisk(breakHabit, burnoutFrequency);
    const submission = { career_answers: answers, break_habit: breakHabit, burnout_frequency: burnoutFrequency };
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("assessment_submissions").insert({ user_id: user.id, answers: submission });
      await supabase.from("assessment_results").upsert({ user_id: user.id, scores, recommended_career: career, wellness_risk: wellness, scoring_version: "workbook-v1" });
    }
    setResult({ career, wellness });
    setSaving(false);
  }

  if (checkingPreviousResult) return <><Nav /><main className="mx-auto max-w-3xl px-5 py-14"><p className="text-slate-600">Checking your saved Career Match...</p></main></>;
  if (previousResult && !result) return <><Nav /><main className="mx-auto max-w-3xl px-5 py-14"><section className="card p-8 text-center"><CheckCircle2 className="mx-auto text-violet-700" size={42} /><p className="eyebrow mt-5">Career Match complete</p><h1 className="mt-2 text-4xl font-black text-ink">You have already completed Career Match.</h1><p className="mx-auto mt-4 max-w-lg leading-7 text-slate-600">Your current direction is <strong>{previousResult.career}</strong>. Continue to your learning roadmap to keep building your progress.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><a href="/roadmap" className="button-primary">Go to learning roadmap <ArrowRight size={17} /></a><button onClick={() => setShowRestartWarning(true)} className="button-secondary">Take the test again</button></div></section>{showRestartWarning && <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-5"><div className="w-full max-w-md rounded-3xl bg-white p-7 text-left shadow-2xl"><h2 className="text-2xl font-black text-ink">Start a new Career Match?</h2><p className="mt-3 leading-7 text-slate-600">Your current career result and learning-roadmap progress will be cleared. This cannot be undone.</p><div className="mt-7 flex justify-end gap-3"><button onClick={() => setShowRestartWarning(false)} className="button-secondary">No, keep my progress</button><button onClick={confirmRestart} className="button-primary">Confirm and start again</button></div></div></div>}</main></>;
  if (result) return <><Nav /><main className="mx-auto max-w-3xl px-5 py-14"><section className="card p-8 text-center"><CheckCircle2 className="mx-auto text-violet-700" size={42} /><p className="eyebrow mt-5">Your starting point</p><h1 className="mt-2 text-4xl font-black text-ink">{result.career}</h1><p className="mx-auto mt-4 max-w-lg leading-7 text-slate-600">This is a direction to explore, not a final decision. Your learning roadmap is ready, and we have also picked {result.wellness.toLowerCase()}-support resources for your study rhythm.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><a href="/roadmap" className="button-primary">View my roadmap <ArrowRight size={17} /></a><a href="/wellness" className="button-secondary">Visit wellness resources <Heart size={17} /></a></div></section></main></>;

  return <><Nav /><main className="mx-auto max-w-3xl px-5 py-14"><p className="eyebrow">Career Match</p><h1 className="mt-3 text-4xl font-black text-ink">Discover a direction that fits you.</h1><p className="mt-3 leading-7 text-slate-600">There are no right answers here. Choose what feels most like you today, and we will suggest a path to explore.</p><div className="mt-9 space-y-5">{careerQuestions.map((question, index) => <section key={question.question} className="card p-6"><p className="font-bold text-ink">{index + 1}. {question.question}</p><div className="mt-4 grid gap-2">{question.options.map((option) => <button onClick={() => setAnswers((previous) => { const next = [...previous]; next[index] = option.label; return next; })} key={option.label} className={`rounded-xl border p-3 text-left text-sm transition ${answers[index] === option.label ? "border-violet-600 bg-violet-50 text-violet-800" : "hover:bg-slate-50"}`}>{option.label}</button>)}</div></section>)}</div>
    <section className="card mt-5 p-6"><div className="flex items-center gap-3"><span className="rounded-xl bg-pink-100 p-2 text-pink-700"><Heart size={20} /></span><div><p className="font-bold text-ink">A quick wellbeing check-in</p><p className="text-sm text-slate-600">This helps us show resources that may be useful. It is not a diagnosis.</p></div></div><div className="mt-6 grid gap-6"><fieldset><legend className="font-bold text-ink">How do you usually handle study breaks?</legend><div className="mt-3 grid gap-2">{breakOptions.map((option) => <button key={option} onClick={() => setBreakHabit(option)} className={`rounded-xl border p-3 text-left text-sm transition ${breakHabit === option ? "border-violet-600 bg-violet-50 text-violet-800" : "hover:bg-slate-50"}`}>{option}</button>)}</div></fieldset><fieldset><legend className="font-bold text-ink">How often do you feel burned out from studying?</legend><div className="mt-3 grid gap-2">{burnoutOptions.map((option) => <button key={option} onClick={() => setBurnoutFrequency(option)} className={`rounded-xl border p-3 text-left text-sm transition ${burnoutFrequency === option ? "border-violet-600 bg-violet-50 text-violet-800" : "hover:bg-slate-50"}`}>{option}</button>)}</div></fieldset></div></section>
    <button disabled={!complete || saving} onClick={finish} className="button-primary mt-6 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving your result..." : <>See my result <Sparkles size={17} /></>}</button>
  </main></>;
}
