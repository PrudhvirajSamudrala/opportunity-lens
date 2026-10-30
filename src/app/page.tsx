"use client";

import { useState } from "react";
import { 
  Search, 
  Target, 
  ArrowUpRight, 
  CheckCircle2, 
  Bookmark, 
  Sparkles, 
  X, 
  AlertCircle, 
  Check, 
  Layers 
} from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: "Internship" | "Open Source" | "Hackathon" | "Entry-Level";
  location: string;
  requiredSkills: string[];
  description: string;
}

const ALL_SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Tailwind",
  "Node.js",
  "PostgreSQL",
  "Python",
  "Git",
  "Docker",
  "REST APIs"
];

const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: "1",
    title: "Frontend Engineering Intern",
    company: "Vercel Labs",
    type: "Internship",
    location: "Remote",
    requiredSkills: ["React", "Next.js", "TypeScript", "Tailwind"],
    description: "Build developer-first interfaces and optimize performance on core web workflows."
  },
  {
    id: "2",
    title: "Open Source Contributor - Client SDK",
    company: "Supabase Core",
    type: "Open Source",
    location: "Global / Async",
    requiredSkills: ["TypeScript", "PostgreSQL", "REST APIs", "Git"],
    description: "Contribute to client SDKs, starter templates, and community-requested drivers."
  },
  {
    id: "3",
    title: "Full-Stack AI Builder Track",
    company: "Buildspace Hackathon",
    type: "Hackathon",
    location: "Virtual",
    requiredSkills: ["Next.js", "TypeScript", "REST APIs", "Tailwind"],
    description: "Sprint to ship and deploy an AI-augmented micro-application with live users."
  },
  {
    id: "4",
    title: "Junior Backend Developer",
    company: "ScaleTech Solutions",
    type: "Entry-Level",
    location: "Hybrid",
    requiredSkills: ["Node.js", "PostgreSQL", "Docker", "REST APIs"],
    description: "Maintain relational data pipelines, design microservices, and optimize query latency."
  }
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userSkills, setUserSkills] = useState<string[]>(["React", "JavaScript", "Git"]);

  const toggleSkill = (skill: string) => {
    if (userSkills.includes(skill)) {
      setUserSkills(userSkills.filter((s) => s !== skill));
    } else {
      setUserSkills([...userSkills, skill]);
    }
  };

  const calculateMatch = (required: string[]) => {
    if (required.length === 0) return { score: 100, matched: [], missing: [] };
    const matched = required.filter((skill) => userSkills.includes(skill));
    const missing = required.filter((skill) => !userSkills.includes(skill));
    const score = Math.round((matched.length / required.length) * 100);
    return { score, matched, missing };
  };

  const filteredOpportunities = INITIAL_OPPORTUNITIES.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.requiredSkills.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = selectedFilter === "All" || item.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              OL
            </div>
            <span className="text-xl font-bold tracking-tight">
              Opportunity<span className="text-indigo-400">Lens</span>
            </span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition text-white text-sm font-medium flex items-center gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4" /> Run Skill Lens ({userSkills.length} selected)
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-6">
          <Layers className="w-3.5 h-3.5" /> Diagnostic & Opportunity Engine
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 max-w-3xl mx-auto leading-tight">
          Find matched opportunities. Close your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
            skill gaps
          </span>.
        </h1>
        <p className="mt-4 text-slate-400 max-w-xl mx-auto text-base sm:text-lg">
          Configure your current toolbelt with the Skill Lens. See exact match percentages and identify missing prerequisites.
        </p>

        {/* Search & Category Filter */}
        <div className="mt-10 max-w-2xl mx-auto flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Filter by role or skill (e.g. Next.js, PostgreSQL)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {["All", "Internship", "Open Source", "Hackathon", "Entry-Level"].map((filter) => (
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

      {/* Opportunity Grid */}
      <main className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-400" /> Opportunities ({filteredOpportunities.length})
          </h2>
          <span className="text-xs text-slate-400">
            Match calculated against <strong>{userSkills.length}</strong> active skills
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOpportunities.map((op) => {
            const { score, matched, missing } = calculateMatch(op.requiredSkills);
            const isHighMatch = score >= 75;
            const isMediumMatch = score >= 50 && score < 75;

            return (
              <div
                key={op.id}
                className="group border border-slate-800/90 rounded-2xl p-5 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {op.type}
                    </span>
                    <div
                      className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md border ${
                        isHighMatch
                          ? "text-emerald-400 bg-emerald-950/60 border-emerald-800/50"
                          : isMediumMatch
                          ? "text-amber-400 bg-amber-950/60 border-amber-800/50"
                          : "text-slate-400 bg-slate-800/60 border-slate-700"
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" /> {score}% match
                    </div>
                  </div>

                  <h3 className="mt-4 font-bold text-lg text-slate-100 group-hover:text-indigo-300 transition">
                    {op.title}
                  </h3>
                  <p className="text-sm text-slate-400 font-medium">
                    {op.company} • {op.location}
                  </p>
                  <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                    {op.description}
                  </p>

                  {/* Diagnostic Breakdown */}
                  <div className="mt-4 space-y-2 text-xs">
                    {matched.length > 0 && (
                      <div>
                        <span className="text-slate-400 block text-[11px] mb-1">Matched Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {matched.map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center gap-1 bg-emerald-950/50 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded text-[11px]"
                            >
                              <Check className="w-2.5 h-2.5" /> {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {missing.length > 0 && (
                      <div>
                        <span className="text-slate-400 block text-[11px] mb-1">Skill Gaps to Close:</span>
                        <div className="flex flex-wrap gap-1">
                          {missing.map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center gap-1 bg-amber-950/40 text-amber-300 border border-amber-800/30 px-2 py-0.5 rounded text-[11px]"
                            >
                              <AlertCircle className="w-2.5 h-2.5" /> {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <button className="text-slate-400 hover:text-slate-200 transition flex items-center gap-1 font-medium">
                    <Bookmark className="w-3.5 h-3.5" /> Save
                  </button>
                  <button className="text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1 font-semibold">
                    View Details <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Skill Lens Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-slate-100">Configure Your Skill Lens</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Select all technologies you currently know. Match percentages and skill gap tags across all opportunities will recalculate in real-time.
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {ALL_SKILLS.map((skill) => {
                const isSelected = userSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-sm shadow-indigo-500/20"
                        : "bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    {skill}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setUserSkills([])}
                className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2 font-medium"
              >
                Clear all
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow"
              >
                Apply Lens
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}