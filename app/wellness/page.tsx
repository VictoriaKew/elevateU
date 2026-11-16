"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Heart, ShieldCheck } from "lucide-react";
import { Nav } from "@/components/nav";
import { createClient } from "@/lib/supabase/client";

type WellnessResource = { id: string; risk_level: string; title: string; resource_type: string | null; description: string | null; url: string | null };

export default function Wellness() {
  const [risk, setRisk] = useState<string | null>(null);
  const [resources, setResources] = useState<WellnessResource[]>([]);
  const [type, setType] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { location.assign("/login"); return; }
      const { data: result } = await supabase.from("assessment_results").select("wellness_risk").eq("user_id", user.id).maybeSingle();
      const recommendedRisk = result?.wellness_risk;
      if (!recommendedRisk) {
        setLoading(false);
        return;
      }
      setRisk(recommendedRisk);
      const allowedRiskLevels = recommendedRisk === "High" ? ["Low", "Mid", "High"] : recommendedRisk === "Mid" ? ["Low", "Mid"] : ["Low"];
      const { data } = await supabase.from("wellness_resources").select("id,risk_level,title,resource_type,description,url").in("risk_level", allowedRiskLevels);
      setResources(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const types = ["All", ...Array.from(new Set(resources.map((resource) => resource.resource_type).filter(Boolean) as string[]))];
  const visibleResources = useMemo(() => resources.filter((resource) => type === "All" || resource.resource_type === type), [resources, type]);

  return <><Nav /><main className="mx-auto max-w-5xl px-5 py-14"><p className="eyebrow">Study Wellness</p><h1 className="mt-3 text-4xl font-black text-ink">Take care of your energy, too.</h1>{loading ? <p className="mt-5 text-slate-600">Finding resources for you...</p> : !risk ? <section className="card mt-8 max-w-2xl p-7"><ShieldCheck className="text-pink-700" /><h2 className="mt-4 text-xl font-black text-ink">Start with Career Match</h2><p className="mt-2 leading-7 text-slate-600">Your Career Match includes a short wellbeing check-in. Complete it first and we will use your answers to choose the level of wellness resources shown here.</p><a href="/assessment" className="button-primary mt-5">Take Career Match</a></section> : <><div className="mt-5 flex max-w-2xl gap-3 rounded-2xl bg-pink-50 p-5 text-pink-950"><ShieldCheck className="shrink-0 text-pink-700" /><p className="leading-6">Your Career Match wellbeing check-in placed you in the <strong>{risk.toLowerCase()}-support</strong> level, so these resources are tailored to that level. This is general study support, not medical advice.</p></div><div className="mt-7 flex flex-wrap gap-2">{types.map((item) => <button onClick={() => setType(item)} key={item} className={`rounded-full px-4 py-2 text-sm font-bold ${type === item ? "bg-violet-700 text-white" : "bg-violet-100 text-violet-800"}`}>{item}</button>)}</div><div className="mt-7 grid gap-5 md:grid-cols-3">{visibleResources.map((resource) => <article key={resource.id} className="card p-6"><div className="flex justify-between gap-3"><span className="rounded-2xl bg-pink-100 p-3 text-pink-700"><Heart /></span><span className="text-right text-xs font-bold text-violet-700">{resource.resource_type ?? "Resource"}</span></div><h2 className="mt-6 text-xl font-extrabold text-ink">{resource.title}</h2><p className="mt-3 leading-7 text-slate-600">{resource.description}</p>{resource.url && <a href={resource.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-violet-700">Explore resource <ExternalLink size={17} /></a>}</article>)}</div>{visibleResources.length === 0 && <p className="mt-8 text-slate-600">Resources for your level are not available just yet. Please check back soon.</p>}</>}</main></>;
}
