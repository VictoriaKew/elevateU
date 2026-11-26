"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { Nav } from "@/components/nav";
import { careerBySlug } from "@/lib/careers";

export default function CareerDetailPage() {
  const params = useParams<{ slug: string }>(); const career = careerBySlug(params.slug);
  if (!career) return <><Nav /><main className="page-shell"><div className="page-content"><h1 className="page-title">Career not found</h1><Link href="/careers" className="button-primary mt-6">Back to careers</Link></div></main></>;
  const Icon = career.Icon;
  return <><Nav /><main className="page-shell"><div className="page-content"><Link href="/careers" className="inline-flex items-center gap-2 text-sm font-bold text-violet-700"><ArrowLeft size={16} /> All careers</Link><section className="card mt-6 overflow-hidden"><div className={`bg-gradient-to-br ${career.color} p-8 text-white sm:p-10`}><span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15"><Icon size={28} /></span><p className="mt-7 text-xs font-black tracking-[.18em] text-violet-100">CAREER PATHWAY</p><h1 className="mt-3 text-4xl font-black">{career.title}</h1><p className="mt-4 max-w-2xl leading-7 text-violet-50">{career.overview}</p></div><div className="grid gap-8 p-8 md:grid-cols-2"><Info title="Main responsibilities" items={career.responsibilities} /><Info title="Skills to build" items={career.skills} /><div><h2 className="text-lg font-black text-ink">Why choose this path?</h2><p className="mt-3 leading-7 text-slate-600">{career.why}</p><h2 className="mt-6 text-lg font-black text-ink">Career opportunities</h2><p className="mt-3 leading-7 text-slate-600">{career.opportunities}</p><p className="mt-6 text-sm text-slate-500">Market information is not shown here because no verified source is currently stored in ElevateU.</p></div><div><h2 className="text-lg font-black text-ink">Advantages</h2><ul className="mt-3 space-y-2 text-slate-600">{career.pros.map((item) => <li key={item}>+ {item}</li>)}</ul><h2 className="mt-6 text-lg font-black text-ink">Things to consider</h2><ul className="mt-3 space-y-2 text-slate-600">{career.cons.map((item) => <li key={item}>- {item}</li>)}</ul></div></div><div className="border-t border-violet-100 p-8"><p className="font-bold text-ink">Want a guided starting point?</p><p className="mt-2 text-slate-600">Career Match can help you compare pathways. You can choose an active pathway later from your Learning Roadmap.</p><Link href="/assessment" className="button-primary mt-4">Take Career Assessment</Link></div></section></div></main></>;
}
function Info({ title, items }: { title: string; items: readonly string[] }) { return <div><h2 className="text-lg font-black text-ink">{title}</h2><ul className="mt-3 space-y-3">{items.map((item) => <li key={item} className="flex gap-2 text-slate-600"><Check className="mt-1 shrink-0 text-violet-700" size={16} />{item}</li>)}</ul></div>; }
