"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
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
  Layers,
  Loader2,
  PlusCircle
} from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: "Internship" | "Open Source" | "Hackathon" | "Entry-Level";
  location: string;
  required_skills: string[];
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

export default function Home() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Modals
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [userSkills, setUserSkills] = useState<string[]>(["React", "JavaScript", "Git"]);

  // Form State for Posting
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newType, setNewType] = useState<Opportunity["type"]>("Internship");
  const [newLocation, setNewLocation] = useState("Remote");
  const [newDescription, setNewDescription] = useState("");
  const [newSkills, setNewSkills] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchOpportunities = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching opportunities:", error);
      } else if (data) {
        setOpportunities(data as Opportunity[]);
      }
    } catch (err) {
      console.error("Fetch exception:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const { data, error } = await supabase
          .from("opportunities")
          .select("*")
          .order("created_at", { ascending: false });

        if (!ignore) {
          if (error) {
            console.error("Error fetching opportunities:", error);
          } else if (data) {
            setOpportunities(data as Opportunity[]);
          }
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Fetch exception:", err);
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, []);

  const toggleSkill = (skill: string) => {
    if (userSkills.includes(skill)) {
      setUserSkills(userSkills.filter((s) => s !== skill));
    } else {
      setUserSkills([...userSkills, skill]);
    }
  };

  const toggleNewPostSkill = (skill: string) => {
    if (newSkills.includes(skill)) {
      setNewSkills(newSkills.filter((s) => s !== skill));
    } else {
      setNewSkills([...newSkills, skill]);
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCompany || !newDescription || newSkills.length === 0) {
      alert("Please fill in all fields and select at least one skill.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("opportunities").insert([
      {
        title: newTitle,
        company: newCompany,
        type: newType,
        location: newLocation,
        description: newDescription,
        required_skills: newSkills
      }
    ]);

    setSubmitting(false);

    if (error) {
      console.error("Insert error:", error);
      alert("Failed to create opportunity. Check console.");
    } else {
      setNewTitle("");
      setNewCompany("");
      setNewDescription("");
      setNewSkills([]);
      setIsPostModalOpen(false);
      fetchOpportunities();
    }
  };

  const calculateMatch = (required: string[] = []) => {
    if (!required || required.length === 0) return { score: 100, matched: [], missing: [] };
    const matched = required.filter((skill) => userSkills.includes(skill));
    const missing = required.filter((skill) => !userSkills.includes(skill));
    const score = Math.round((matched.length / required.length) * 100);
    return { score, matched, missing };
  };

  const filteredOpportunities = opportunities.filter((item) => {
    const skills = item.required_skills || [];
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skills.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
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

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-4 h-4 text-slate-300" /> Post Opportunity
            </button>

            <button
              onClick={() => setIsSkillModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition text-white text-xs sm:text-sm font-medium flex items-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4" /> Run Skill Lens ({userSkills.length})
            </button>
          </div>
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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
            <p className="text-sm">Fetching opportunities from Supabase...</p>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="text-center py-20 text-slate-500 text-sm">
            No opportunities found matching your criteria.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOpportunities.map((op) => {
              const { score, matched, missing } = calculateMatch(op.required_skills);
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
        )}
      </main>

      {/* Skill Lens Modal */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsSkillModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-slate-100">Configure Your Skill Lens</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Select all technologies you currently know. Match percentages and skill gap tags will recalculate in real-time.
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
                onClick={() => setIsSkillModalOpen(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow"
              >
                Apply Lens
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Opportunity Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsPostModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-100 mb-1">Post an Opportunity</h3>
            <p className="text-xs text-slate-400 mb-5">
              Add a real role, internship, or hackathon track directly into the database.
            </p>

            <form onSubmit={handleCreateOpportunity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Research Intern"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Org</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google Cloud"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Remote or Hyderabad"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Opportunity Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as Opportunity["type"])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Internship">Internship</option>
                  <option value="Open Source">Open Source</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Entry-Level">Entry-Level</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Required Skills (Select applicable)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-950 rounded-lg border border-slate-800">
                  {ALL_SKILLS.map((skill) => {
                    const isSelected = newSkills.includes(skill);
                    return (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => toggleNewPostSkill(skill)}
                        className={`text-[11px] px-2.5 py-1 rounded border transition ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-500 text-white"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summary of responsibilities and scope..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {submitting ? "Publishing..." : "Publish to Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}