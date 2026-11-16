"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Route } from "lucide-react";
import { Nav } from "@/components/nav";
import { createClient } from "@/lib/supabase/client";

type Resource = { id: string; title: string; resource_type: string | null; description: string | null; url: string | null; sort_order: number };

export default function Roadmap() {
  const [career, setCareer] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { location.assign("/login"); return; }
      const { data: result } = await supabase.from("assessment_results").select("recommended_career").eq("user_id", user.id).maybeSingle();
      const recommendedCareer = result?.recommended_career ?? "";
      setCareer(recommendedCareer);
      if (recommendedCareer) {
        const [{ data: resourceData }, { data: progressData }] = await Promise.all([
          supabase.from("roadmap_resources").select("id,title,resource_type,description,url,sort_order").eq("career_track", recommendedCareer).order("sort_order"),
          supabase.from("roadmap_progress").select("resource_id,status").eq("user_id", user.id).eq("status", "completed"),
        ]);
        setResources(resourceData ?? []);
        setCompleted((progressData ?? []).map((item) => item.resource_id));
      }
      setLoading(false);
    }
    load();
  }, []);

  async function markComplete(resourceId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || completed.includes(resourceId)) return;
    const { error } = await supabase.from("roadmap_progress").upsert({ user_id: user.id, resource_id: resourceId, status: "completed", started_at: new Date().toISOString(), completed_at: new Date().toISOString() }, { onConflict: "user_id,resource_id" });
    if (!error) setCompleted((current) => [...current, resourceId]);
  }

  const progress = resources.length ? Math.round((completed.length / resources.length) * 100) : 0;
  return <><Nav /><main className="mx-auto max-w-5xl px-5 py-14"><p className="eyebrow">Learning Roadmap</p><h1 className="mt-3 text-4xl font-black text-ink">Build skills with purpose.</h1>{loading ? <p className="mt-5 text-slate-600">Finding your personalised roadmap...</p> : !career ? <section className="card mt-8 p-7"><Route className="text-violet-700" /><h2 className="mt-4 text-xl font-black text-ink">Start with Career Match</h2><p className="mt-2 leading-7 text-slate-600">Complete the short assessment first, and we will build this page around the direction you choose.</p><a href="/assessment" className="button-primary mt-5">Take Career Match</a></section> : <><p className="mt-3 max-w-2xl leading-7 text-slate-600">Your {career} roadmap has practical courses, videos and project challenges. Mark items complete as you go.</p><div className="mt-6 rounded-2xl bg-violet-50 p-5"><div className="flex items-center justify-between gap-4"><p className="font-bold text-violet-950">Your progress</p><span className="text-sm font-bold text-violet-700">{completed.length} of {resources.length} complete</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-violet-200"><div className="h-full rounded-full bg-violet-700 transition-all" style={{ width: `${progress}%` }} /></div></div>{resources.length === 0 ? <p className="mt-8 text-slate-600">Your resources are being prepared. Run the Supabase seed script to load the workbook catalogue.</p> : <div className="mt-8 grid gap-5 md:grid-cols-2">{resources.map((resource, index) => { const done = completed.includes(resource.id); return <article key={resource.id} className="card p-6"><div className="flex items-start justify-between gap-4"><span className="text-sm font-bold tracking-widest text-violet-400">{String(index + 1).padStart(2, "0")}</span><span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-800">{resource.resource_type ?? "Resource"}</span></div><h2 className="mt-5 text-xl font-extrabold text-ink">{resource.title}</h2><p className="mt-3 min-h-14 leading-7 text-slate-600">{resource.description}</p><div className="mt-5 flex flex-wrap gap-3">{resource.url && <a href={resource.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-violet-700">Open resource <ExternalLink size={15} /></a>}<button onClick={() => markComplete(resource.id)} disabled={done} className={`inline-flex items-center gap-2 text-sm font-bold ${done ? "text-emerald-700" : "text-slate-600 hover:text-violet-700"}`}><CheckCircle2 size={17} />{done ? "Completed" : "Mark complete"}</button></div></article>; })}</div>}</>}</main></>;
}
