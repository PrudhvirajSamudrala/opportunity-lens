"use client";

import { useState } from "react";
import { Search, Compass, Target, ArrowUpRight, CheckCircle2, Bookmark, Sparkles } from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: "Internship" | "Open Source" | "Hackathon" | "Entry-Level";
  location: string;
  matchScore: number;
  tags: string[];
  description: string;
}

const SAMPLE_OPPORTUNITIES: Opportunity[] = [
  {
    id: "1",
    title: "Frontend Engineering Intern",
    company: "Vercel Labs",
    type: "Internship",
    location: "Remote",
    matchScore: 92,
    tags: ["React", "Next.js", "TypeScript", "Tailwind"],
    description: "Build developer-first interfaces and optimize performance on core web workflows."
  },
  {
    id: "2",
    title: "Open Source Contributor - Good First Issues",
    company: "Supabase Core",
    type: "Open Source",
    location: "Global / Async",
    matchScore: 85,
    tags: ["PostgreSQL", "Auth", "Documentation"],
    description: "Contribute to client SDKs and starter templates with maintainer guidance."
  },
  {
    id: "3",
    title: "Full-Stack AI Builder Track",
    company: "Buildspace Hack",
    type: "Hackathon",
    location: "Virtual",
    matchScore: 78,
    tags: ["Next.js", "LLM APIs", "Vercel"],
    description: "48-hour sprint to deploy an AI-augmented micro-SaaS with active user feedback."
  }
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filteredOpportunities = SAMPLE_OPPORTUNITIES.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = selectedFilter === "All" || item.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              OL
            </div>
            <span className="text-xl font-bold tracking-tight">Opportunity<span className="text-indigo-400">Lens</span></span>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium">
            <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition text-white font-medium flex items-center gap-2 shadow-sm">
              <Sparkles className="w-4 h-4" /> Run Skill Lens
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" /> No More Blind Applications
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 max-w-3xl mx-auto leading-tight">
          Find matched opportunities. Close your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">skill gaps</span>.
        </h1>
        <p className="mt-4 text-slate-400 max-w-xl mx-auto text-base sm:text-lg">
          Stop applying into the void. OpportunityLens evaluates your actual stack against real openings, then charts your exact path forward.
        </p>

        {/* Search & Quick Filters */}
        <div className="mt-10 max-w-2xl mx-auto flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by role, stack (e.g. Next.js, TypeScript)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {["All", "Internship", "Open Source", "Hackathon"].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition ${
                  selectedFilter === filter
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feed Section */}
      <main className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-400" /> Matched Openings ({filteredOpportunities.length})
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOpportunities.map((op) => (
            <div
              key={op.id}
              className="group border border-slate-800/90 rounded-2xl p-5 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    {op.type}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3" /> {op.matchScore}% match
                  </div>
                </div>

                <h3 className="mt-4 font-bold text-lg text-slate-100 group-hover:text-indigo-300 transition">
                  {op.title}
                </h3>
                <p className="text-sm text-slate-400 font-medium">{op.company} • {op.location}</p>
                <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                  {op.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60">
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {op.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <button className="text-slate-400 hover:text-slate-200 transition flex items-center gap-1 font-medium">
                    <Bookmark className="w-3.5 h-3.5" /> Save
                  </button>
                  <button className="text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1 font-semibold">
                    View Details <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}