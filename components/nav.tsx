"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, LogOut, Moon, Sparkles, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Viewer = { name: string; email: string; initials: string } | null;
const links = [{ href: "/careers", label: "Careers" }, { href: "/assessment", label: "Career Match" }, { href: "/roadmap", label: "Roadmap" }, { href: "/wellness", label: "Wellness" }, { href: "/pomodoro", label: "Pomodoro" }];

export function Nav() {
  const [viewer, setViewer] = useState<Viewer>(null);
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setViewer(null);
      const name = String(user.user_metadata.full_name || user.user_metadata.name || user.email?.split("@")[0] || "Student");
      const email = user.email || "";
      setViewer({ name, email, initials: name.split(/\s+/).map((word: string) => word[0]).slice(0, 2).join("").toUpperCase() });
      // Profile creation must never delay showing an authenticated user in the UI.
      void supabase.from("profiles").upsert({ id: user.id, email, display_name: name });
    };
    load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { void load(); });
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    const savedTheme = localStorage.getItem("elevateu-theme");
    const shouldUseDark = savedTheme ? savedTheme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);
  function toggleTheme() {
    const nextTheme = !darkMode;
    setDarkMode(nextTheme);
    localStorage.setItem("elevateu-theme", nextTheme ? "dark" : "light");
    document.documentElement.classList.toggle("dark", nextTheme);
  }
  async function signOut() { await createClient().auth.signOut(); setViewer(null); location.assign("/"); }
  return <header className="glass-nav sticky top-0 z-30"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
    <Link href="/home" className="flex items-center gap-2.5"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-800 text-white"><Sparkles size={20}/></span><span className="text-2xl font-extrabold tracking-tight text-ink">Elevate<span className="text-violet-700">U</span></span></Link>
    <nav aria-label="Main navigation" className="hidden gap-1 text-sm font-semibold lg:flex">{links.map(({ href, label }) => { const active = pathname === href || pathname.startsWith(`${href}/`); return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`nav-link whitespace-nowrap ${active ? "nav-link-active" : ""}`}>{label}</Link>; })}</nav>
    <div className="flex items-center gap-2"><button title={darkMode ? "Use light mode" : "Use dark mode"} aria-label={darkMode ? "Use light mode" : "Use dark mode"} onClick={toggleTheme} className="min-h-11 min-w-11 rounded-xl p-2.5 text-slate-500 transition hover:bg-violet-50 hover:text-violet-700">{darkMode ? <Sun size={18}/> : <Moon size={18}/>}</button>{viewer ? <><div className="hidden text-right sm:block"><p className="max-w-32 truncate text-sm font-bold text-ink">{viewer.name}</p><p className="max-w-36 truncate text-xs text-slate-500">{viewer.email}</p></div><span title={viewer.name} className="grid h-10 w-10 place-items-center rounded-full bg-violet-100 text-sm font-black text-violet-700">{viewer.initials}</span><button title="Sign out" aria-label="Sign out" onClick={signOut} className="min-h-11 min-w-11 rounded-xl p-2 text-slate-500 hover:bg-violet-50 hover:text-violet-700"><LogOut size={18}/></button></> : <Link className="button-primary px-4 py-2.5" href="/login"><LogIn size={16}/> Sign in</Link>}</div>
  </div><nav aria-label="Mobile navigation" className="flex gap-1 overflow-x-auto border-t border-violet-100 px-3 py-2 text-sm font-semibold lg:hidden">{links.map(({ href, label }) => { const active = pathname === href || pathname.startsWith(`${href}/`); return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`nav-link whitespace-nowrap ${active ? "nav-link-active" : ""}`}>{label}</Link>; })}</nav></header>;
}
