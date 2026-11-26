"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, RefreshCw, Route } from "lucide-react";
import { Nav } from "@/components/nav";
import { Modal } from "@/components/modal"; import { createClient } from "@/lib/supabase/client";
import { careers } from "@/lib/careers";

type Resource = { id: string; title: string; resource_type: string | null; description: string | null; url: string | null; sort_order: number };

export default function Roadmap() {
  const [career, setCareer] = useState("");
  const [recommended, setRecommended] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [switching, setSwitching] = useState(false);
  const [chosenCareer, setChosenCareer] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [switchError, setSwitchError] = useState("");
  const [savingSwitch, setSavingSwitch] = useState(false);

  useEffect(() => {
    async function loadRoadmap() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { location.assign("/login"); return; }

      const { data: result, error: resultError } = await supabase.from("assessment_results")
        .select("recommended_career,active_career").eq("user_id", user.id).maybeSingle();
      // Older databases can have the recommendation before the active column
      // migration has been applied. Do not mistake a query error for no result.
      const legacy = resultError ? await supabase.from("assessment_results").select("recommended_career").eq("user_id", user.id).maybeSingle() : null;
      const { data: latestAttempt } = await supabase.from("assessment_submissions")
        .select("recommended_career").eq("user_id", user.id).not("recommended_career", "is", null)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();

      const latest = result?.recommended_career ?? legacy?.data?.recommended_career ?? latestAttempt?.recommended_career ?? "";
      const active = result?.active_career ?? result?.recommended_career ?? latest;
      if (resultError) setNotice("Your saved recommendation is shown as your pathway. Apply the career pathway migrations to enable switching and save the active pathway.");
      if (result && !result.active_career && active && !resultError) {
        const { error } = await supabase.from("assessment_results").update({ active_career: active }).eq("user_id", user.id);
        if (error) setNotice("Your assessment is saved, but the active pathway could not be updated. Please apply the latest Supabase migration.");
      }

      setCareer(active);
      setRecommended(latest);
      if (active) {
        const [{ data: resourceData }, { data: progressData }] = await Promise.all([
          supabase.from("roadmap_resources").select("id,title,resource_type,description,url,sort_order").eq("career_track", active).order("sort_order"),
          supabase.from("roadmap_progress").select("resource_id").eq("user_id", user.id).eq("status", "completed"),
        ]);
        setResources(resourceData ?? []);
        const resourceIds = new Set((resourceData ?? []).map((item) => item.id));
        setCompleted((progressData ?? []).map((item) => item.resource_id).filter((id) => resourceIds.has(id)));
      }
      setLoading(false);
    }
    loadRoadmap();
  }, []);

  async function markComplete(resourceId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || completed.includes(resourceId)) return;
    const { error } = await supabase.from("roadmap_progress").upsert({ user_id: user.id, resource_id: resourceId, status: "completed", started_at: new Date().toISOString(), completed_at: new Date().toISOString() }, { onConflict: "user_id,resource_id" });
    if (!error) setCompleted((current) => [...current, resourceId]);
  }

  const progress = resources.length ? Math.round(completed.length / resources.length * 100) : 0;
  const pathwayNote = recommended && recommended !== career ? ` Your latest Career Match recommendation is ${recommended}.` : "";

  return <><Nav /><main className="page-shell"><div className="page-content">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">LEARNING ROADMAP</p><h1 className="page-title">Build skills with purpose.</h1></div>{career && <button onClick={() => { setSwitching(true); setChosenCareer(""); setSwitchError(""); }} className="button-secondary"><RefreshCw size={16} /> Switch Career Pathway</button>}</div>
    {loading ? <p className="mt-5 text-slate-600">Finding your personalised roadmap...</p> : !career ? <EmptyRoadmap /> : <ActiveRoadmap career={career} pathwayNote={pathwayNote} notice={notice} resources={resources} completed={completed} progress={progress} onComplete={markComplete} />}
  {switching && <SwitchDialog career={career} chosenCareer={chosenCareer} setChosenCareer={setChosenCareer} confirming={confirming} setConfirming={setConfirming} error={switchError} saving={savingSwitch} onClose={() => setSwitching(false)} onConfirm={async () => { if (!chosenCareer || savingSwitch) return; setSavingSwitch(true); setSwitchError(""); const { error } = await createClient().rpc("switch_active_career", { p_career: chosenCareer }); if (error) { setSwitchError(error.code === "PGRST202" || error.code === "42883" ? "Career switching is not yet set up in the database. Apply the Supabase migrations and try again. Your progress is unchanged." : "We could not switch your pathway. Your progress is unchanged. Please try again."); setSavingSwitch(false); return; } location.assign("/roadmap?switched=1"); }} />}
  </div></main></>;
}

function SwitchDialog({ career, chosenCareer, setChosenCareer, confirming, setConfirming, error, saving, onClose, onConfirm }: { career: string; chosenCareer: string; setChosenCareer: (value: string) => void; confirming: boolean; setConfirming: (value: boolean) => void; error: string; saving: boolean; onClose: () => void; onConfirm: () => void }) { return <Modal labelledBy="switch-title" onClose={onClose} closeDisabled={saving}><h2 id="switch-title" className="text-2xl font-black text-ink">Switch career pathway</h2>{!confirming ? <><p className="mt-3 leading-7 text-slate-600">Only one learning pathway can be active at a time. Selecting a new pathway permanently resets your current roadmap progress; it does not change your latest recommendation.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{careers.map((item) => <button key={item.slug} onClick={() => setChosenCareer(item.title)} aria-pressed={chosenCareer === item.title} className={`rounded-2xl border p-4 text-left font-bold ${chosenCareer === item.title ? "border-violet-600 bg-violet-50 text-violet-800" : "border-violet-100 text-ink hover:bg-violet-50"}`} disabled={item.title === career}>{item.title}{item.title === career && <span className="ml-2 text-xs text-slate-500">Current</span>}</button>)}</div><div className="mt-7 flex justify-end gap-3"><button onClick={onClose} className="button-secondary">Cancel</button><button disabled={!chosenCareer} onClick={() => setConfirming(true)} className="button-primary disabled:opacity-50">Continue</button></div></> : <><p className="mt-3 leading-7 text-slate-600">Switch to <strong>{chosenCareer}</strong>? This permanently resets the progress for {career}. Your recommendation and assessment history will not change.</p>{error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}<div className="mt-7 flex justify-end gap-3"><button disabled={saving} onClick={() => setConfirming(false)} className="button-secondary">Back</button><button disabled={saving} onClick={onConfirm} className="button-primary disabled:opacity-50">{saving ? "Switching..." : "Confirm switch"}</button></div></>}</Modal>; }

function EmptyRoadmap() { return <section className="card mt-8 p-7"><Route className="text-violet-700" /><h2 className="mt-4 text-xl font-black text-ink">Start with Career Match</h2><p className="mt-2 leading-7 text-slate-600">Complete the short assessment first, and we will build this page around the direction you choose.</p><Link href="/assessment" className="button-primary mt-5">Take Career Match</Link></section>; }
function ActiveRoadmap({ career, pathwayNote, notice, resources, completed, progress, onComplete }: { career: string; pathwayNote: string; notice: string; resources: Resource[]; completed: string[]; progress: number; onComplete: (id: string) => void }) {
  const progressWidth = `${progress}%`;
  const cards = resources.map((resource, index) => <ResourceCard key={resource.id} resource={resource} index={index} done={completed.includes(resource.id)} onComplete={onComplete} />);
  let resourceArea;
  if (resources.length === 0) resourceArea = <section className="card mt-8 p-7"><h2 className="text-xl font-black text-ink">Your pathway is ready</h2><p className="mt-2 text-slate-600">Learning resources for this pathway are being added. Please check back soon.</p></section>;
  else resourceArea = <div className="mt-8 grid gap-5 md:grid-cols-2">{cards}</div>;
  return (<div>
    <p className="page-lede">You are following the <b>{career}</b> pathway.{pathwayNote}</p>
    {notice && <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">{notice}</p>}
    <div className="mt-6 rounded-2xl bg-violet-50 p-5">
      <div className="flex justify-between gap-4"><b className="text-violet-950">Your progress</b><span className="text-sm font-bold text-violet-700">{completed.length} of {resources.length} complete</span></div>
      <div role="progressbar" aria-label={`${career} roadmap progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="mt-3 h-2 overflow-hidden rounded-full bg-violet-200"><div className="h-full rounded-full bg-violet-700" style={{ width: progressWidth }} /></div>
    </div>
    {resourceArea}
  </div>);
}
function ResourceCard({ resource, index, done, onComplete }: { resource: Resource; index: number; done: boolean; onComplete: (id: string) => void }) { return <article className="card p-6"><div className="flex justify-between gap-3"><span className="text-sm font-bold text-violet-400">{String(index + 1).padStart(2, "0")}</span><span className="text-xs font-bold text-violet-700">{resource.resource_type ?? "Resource"}</span></div><h2 className="mt-5 text-xl font-black text-ink">{resource.title}</h2><p className="mt-3 leading-7 text-slate-600">{resource.description}</p><div className="mt-5 flex gap-4">{resource.url && <a href={resource.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-violet-700">Open <ExternalLink size={15} /></a>}<button onClick={() => onComplete(resource.id)} disabled={done} className="inline-flex items-center gap-1 text-sm font-bold text-slate-600"><CheckCircle2 size={16} />{done ? "Completed" : "Mark complete"}</button></div></article>; }
