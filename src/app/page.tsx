"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { 
  Search, 
  Target, 
  ArrowUpRight, 
  CheckCircle2, 
  Sparkles, 
  X, 
  AlertCircle, 
  Check, 
  Layers, 
  Loader2, 
  PlusCircle, 
  ExternalLink, 
  BookOpen, 
  MapPin, 
  Building2, 
  Calendar, 
  Trash2, 
  User as UserIcon, 
  LogOut, 
  Flame, 
  Send,
  FileText,
  ChevronLeft,
  ChevronRight,
  Briefcase
} from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: "Internship" | "Open Source" | "Hackathon" | "Entry-Level";
  location: string;
  required_skills: string[];
  description: string;
  apply_url?: string;
  user_id?: string;
  created_at?: string;
}

type Stage = "Saved" | "Applied" | "Interviewing" | "Offer";

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

const SKILL_RESOURCES: Record<string, { label: string; url: string; guide: string }> = {
  "React": { label: "React.dev Docs", url: "https://react.dev/learn", guide: "Master component state, props, and standard Hooks (useState, useEffect)." },
  "Next.js": { label: "Next.js Learn", url: "https://nextjs.org/learn", guide: "Understand Server vs Client Components, Server Actions, and App Router routing." },
  "TypeScript": { label: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html", guide: "Focus on Interfaces, Types, Generics, and strict null checks." },
  "JavaScript": { label: "MDN JavaScript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", guide: "Review Closures, Event Loop, asynchronous Promises, and modern ES6+ methods." },
  "Tailwind": { label: "Tailwind CSS", url: "https://tailwindcss.com/docs/utility-first", guide: "Learn utility classes, responsive prefixes (sm:, md:), and pseudo-class styling." },
  "Node.js": { label: "Node.js Guide", url: "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs", guide: "Understand asynchronous event runtime, Express/Fastify frameworks, and file streams." },
  "PostgreSQL": { label: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com/", guide: "Write indexed relational queries, Foreign Key constraints, and complex joins." },
  "Python": { label: "Python Tutorial", url: "https://docs.python.org/3/tutorial/", guide: "Cover comprehensions, object-oriented concepts, and fast scripting APIs." },
  "Git": { label: "GitHub Git Handbook", url: "https://docs.github.com/en/get-started/using-git/about-git", guide: "Learn branch rebasing, merge conflict resolution, and PR workflows." },
  "Docker": { label: "Docker Curriculum", url: "https://docker-curriculum.com/", guide: "Practice writing reproducible Dockerfiles, building images, and compose." },
  "REST APIs": { label: "RESTful API Design", url: "https://restfulapi.net/", guide: "Learn standard HTTP response codes, idempotency, pagination, and payload validation." }
};

const ITEMS_PER_PAGE = 12;

export default function Home() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [matchThresholdOnly, setMatchThresholdOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Modals
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [activeDetailModal, setActiveDetailModal] = useState<Opportunity | null>(null);

  // User Skills & Pipeline Tracking
  const [userSkills, setUserSkills] = useState<string[]>(["React", "JavaScript", "TypeScript", "Git"]);
  const [resumeText, setResumeText] = useState("");
  const [resumeFeedback, setResumeFeedback] = useState("");

  const [stages, setStages] = useState<Record<string, Stage>>(() => {
    if (typeof window !== "undefined") {
      try {
        const item = localStorage.getItem("opportunity_stages");
        return item ? JSON.parse(item) : {};
      } catch {
        return {};
      }
    }
    return {};
  });

  // Post Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newType, setNewType] = useState<Opportunity["type"]>("Internship");
  const [newLocation, setNewLocation] = useState("Remote");
  const [newApplyUrl, setNewApplyUrl] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSkills, setNewSkills] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const syncUserProfile = useCallback(async (activeUser: User) => {
    try {
      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", activeUser.id)
        .single();

      if (data) {
        if (data.selected_skills?.length) setUserSkills(data.selected_skills);
        if (data.application_stages && Object.keys(data.application_stages).length) {
          setStages(data.application_stages);
        }
      } else {
        await supabase.from("user_profiles").upsert({
          id: activeUser.id,
          email: activeUser.email,
          selected_skills: ["React", "JavaScript", "TypeScript", "Git"],
          application_stages: {}
        });
      }
    } catch (err) {
      console.error("Profile sync exception:", err);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) syncUserProfile(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) syncUserProfile(session.user);
    });

    let ignore = false;
    async function loadInitial() {
      try {
        const { data, error } = await supabase
          .from("opportunities")
          .select("*")
          .order("created_at", { ascending: false });

        if (!ignore) {
          if (error) console.error("Error:", error);
          else if (data) setOpportunities(data as Opportunity[]);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error(err);
          setLoading(false);
        }
      }
    }

    loadInitial();

    const channel = supabase
      .channel("realtime-master-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "opportunities" },
        () => {
          fetchOpportunities();
        }
      )
      .subscribe();

    return () => {
      ignore = true;
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [fetchOpportunities, syncUserProfile]);

  const updateStage = async (id: string, stage: Stage | null) => {
    const next = { ...stages };
    if (!stage) {
      delete next[id];
    } else {
      next[id] = stage;
    }
    setStages(next);
    localStorage.setItem("opportunity_stages", JSON.stringify(next));

    if (user) {
      await supabase
        .from("user_profiles")
        .upsert({ id: user.id, application_stages: next });
    }
  };

  const handleOAuthLogin = async (provider: "github") => {
    setAuthLoading(true);
    setAuthError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin }
    });
    if (error) setAuthError(error.message);
    setAuthLoading(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    if (authMode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
      });
      if (error) setAuthError(error.message);
      else {
        alert("Account registered! Check your inbox if verification is enabled.");
        setIsAuthModalOpen(false);
        setAuthEmail("");
        setAuthPassword("");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });
      if (error) setAuthError(error.message);
      else {
        setIsAuthModalOpen(false);
        setAuthEmail("");
        setAuthPassword("");
      }
    }
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const toggleSkill = async (skill: string) => {
    const next = userSkills.includes(skill)
      ? userSkills.filter(s => s !== skill)
      : [...userSkills, skill];
    setUserSkills(next);

    if (user) {
      await supabase
        .from("user_profiles")
        .upsert({ id: user.id, selected_skills: next });
    }
  };

  const handleParseResume = () => {
    if (!resumeText.trim()) return;
    const lower = resumeText.toLowerCase();
    const matchedSkills = ALL_SKILLS.filter(skill => lower.includes(skill.toLowerCase()));

    if (matchedSkills.length > 0) {
      const combined = Array.from(new Set([...userSkills, ...matchedSkills]));
      setUserSkills(combined);
      setResumeFeedback(`Extracted ${matchedSkills.length} skills: ${matchedSkills.join(", ")}`);
      if (user) {
        supabase.from("user_profiles").upsert({ id: user.id, selected_skills: combined });
      }
      setTimeout(() => {
        setIsResumeModalOpen(false);
        setResumeFeedback("");
        setResumeText("");
      }, 1400);
    } else {
      setResumeFeedback("No recognized tech stack keywords found. Check pasting format.");
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCompany || !newDescription || newSkills.length === 0) {
      alert("Please fill in required fields and select at least one skill.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("opportunities").insert([
      {
        title: newTitle,
        company: newCompany,
        type: newType,
        location: newLocation,
        apply_url: newApplyUrl || `https://github.com/search?q=${encodeURIComponent(newCompany)}`,
        description: newDescription,
        required_skills: newSkills,
        user_id: user?.id ?? null
      }
    ]);

    setSubmitting(false);

    if (error) {
      console.error("Insert error:", error);
      alert("Failed to create opportunity. Ensure database columns match.");
    } else {
      setNewTitle("");
      setNewCompany("");
      setNewDescription("");
      setNewApplyUrl("");
      setNewSkills([]);
      setIsPostModalOpen(false);
      fetchOpportunities();
    }
  };

  const handleDeleteOpportunity = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this opportunity?")) return;

    setDeletingId(id);
    const { error } = await supabase.from("opportunities").delete().eq("id", id);
    setDeletingId(null);

    if (error) {
      console.error("Delete error:", error);
      alert("Failed to delete opportunity.");
    } else {
      setOpportunities(prev => prev.filter(op => op.id !== id));
      if (activeDetailModal?.id === id) setActiveDetailModal(null);
      updateStage(id, null);
    }
  };

  const calculateMatch = useCallback((required: string[] = []) => {
    if (!required || required.length === 0) return { score: 100, matched: [], missing: [] };
    const matched = required.filter((skill) => userSkills.includes(skill));
    const missing = required.filter((skill) => !userSkills.includes(skill));
    const score = Math.round((matched.length / required.length) * 100);
    return { score, matched, missing };
  }, [userSkills]);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((item) => {
      const skills = item.required_skills || [];
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skills.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = selectedFilter === "All" || item.type === selectedFilter;
      const { score } = calculateMatch(skills);
      const matchesThreshold = !matchThresholdOnly || score >= 60;
      return matchesSearch && matchesFilter && matchesThreshold;
    });
  }, [opportunities, searchTerm, selectedFilter, matchThresholdOnly, calculateMatch]);

  const totalPages = Math.ceil(filteredOpportunities.length / ITEMS_PER_PAGE) || 1;
  const paginatedOpportunities = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOpportunities.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOpportunities, currentPage]);

  const trackedCount = Object.keys(stages).length;

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200 relative overflow-hidden font-sans">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[480px] bg-gradient-to-b from-emerald-500/10 via-cyan-500/10 to-transparent blur-3xl opacity-75" />

      {/* Header */}
      <header className="border-b border-emerald-950/40 bg-[#070b12]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-emerald-500/20">
              OL
            </div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              Opportunity<span className="text-emerald-400">Lens</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsTrackerModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pipeline</span> ({trackedCount})
            </button>

            <button
              onClick={() => setIsResumeModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Parse Resume</span>
            </button>

            <button
              onClick={() => setIsPostModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Post Role</span>
            </button>

            <button
              onClick={() => setIsSkillModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 transition text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Skill Lens</span>
              <span className="bg-slate-950/20 px-1 rounded text-[11px] font-mono">{userSkills.length}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="h-8 w-8 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-xs font-bold text-emerald-300 uppercase shadow-inner">
                  {user.email?.charAt(0) || "U"}
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode("login");
                  setIsAuthModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
              >
                <UserIcon className="w-3.5 h-3.5" /> Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 text-xs font-semibold mb-6 shadow-inner">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          Autonomous Diagnostic & Opportunity Engine
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Precision matching for engineering roles. Instant{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            skill gap roadmaps.
          </span>
        </h1>

        <p className="mt-4 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Calibrate your tech stack with the Skill Lens or paste your resume. Discover entry-level roles, hackathons, and open-source programs mapped directly to your current competencies.
        </p>

        {/* Search, Filter & Quick-Toggles */}
        <div className="mt-8 max-w-3xl mx-auto space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title, company, or tech stack (e.g. Next.js, Anthropic, Python)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#0d1424]/90 border border-slate-800/80 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/40 shadow-xl transition"
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {["All", "Internship", "Open Source", "Hackathon", "Entry-Level"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setSelectedFilter(filter);
                    setCurrentPage(1);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                    selectedFilter === filter
                      ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                      : "bg-[#0d1424] text-slate-400 border border-slate-800/80 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setMatchThresholdOnly(!matchThresholdOnly);
                setCurrentPage(1);
              }}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition ${
                matchThresholdOnly 
                  ? "bg-teal-500/20 border-teal-500/50 text-teal-300" 
                  : "bg-[#0d1424] text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Top Matches (&ge;60%)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Catalog Feed */}
      <main className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Opportunities ({filteredOpportunities.length})
            </h2>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
            <p className="text-xs font-mono">Synchronizing opportunities with PostgreSQL...</p>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="text-center py-24 text-slate-500 border border-dashed border-slate-800/80 rounded-2xl bg-[#0d1424]/40">
            <p className="text-sm font-medium">No opportunities match your current filter parameters.</p>
            <p className="text-xs text-slate-600 mt-1">Try clearing your search keyword or relaxing your Skill Lens.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedOpportunities.map((op) => {
              const { score, matched, missing } = calculateMatch(op.required_skills);
              const isHighMatch = score >= 75;
              const isMediumMatch = score >= 50 && score < 75;
              const isDeleting = deletingId === op.id;
              const currentStage = stages[op.id];

              return (
                <div
                  key={op.id}
                  className="group rounded-2xl p-5 bg-[#0d1424]/60 border border-slate-800/70 hover:border-emerald-500/40 hover:bg-[#0d1424]/90 transition-all duration-300 flex flex-col justify-between shadow-lg relative"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800">
                          {op.type}
                        </span>
                        {currentStage && (
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                            currentStage === "Offer" ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60" :
                            currentStage === "Interviewing" ? "bg-cyan-950/80 text-cyan-300 border-cyan-700/60" :
                            currentStage === "Applied" ? "bg-blue-950/80 text-blue-300 border-blue-700/60" :
                            "bg-amber-950/80 text-amber-300 border-amber-700/60"
                          }`}>
                            {currentStage}
                          </span>
                        )}
                      </div>

                      <div
                        className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          isHighMatch
                            ? "text-emerald-300 bg-emerald-950/60 border-emerald-500/30 shadow-sm shadow-emerald-500/20"
                            : isMediumMatch
                            ? "text-teal-300 bg-teal-950/60 border-teal-500/30"
                            : "text-slate-400 bg-slate-900 border-slate-800"
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{score}% match</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isHighMatch 
                            ? "bg-gradient-to-r from-emerald-500 to-teal-400" 
                            : isMediumMatch 
                            ? "bg-gradient-to-r from-teal-500 to-cyan-400" 
                            : "bg-slate-700"
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>

                    <h3 className="mt-4 font-bold text-base text-white group-hover:text-emerald-300 transition line-clamp-1">
                      {op.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {op.company} • <span className="text-slate-500">{op.location}</span>
                    </p>

                    <p className="mt-3 text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {op.description}
                    </p>

                    <div className="mt-4 space-y-2 text-xs">
                      {matched.length > 0 && (
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block mb-1">
                            Matched
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {matched.map((s) => (
                              <span
                                key={s}
                                className="inline-flex items-center gap-1 bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded text-[11px] font-medium"
                              >
                                <Check className="w-2.5 h-2.5" /> {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {missing.length > 0 && (
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block mb-1">
                            Required Gap
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {missing.map((s) => (
                              <span
                                key={s}
                                className="inline-flex items-center gap-1 bg-rose-950/30 text-rose-300 border border-rose-900/40 px-2 py-0.5 rounded text-[11px] font-medium"
                              >
                                <AlertCircle className="w-2.5 h-2.5 text-rose-400" /> {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-3.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <select
                        value={currentStage || ""}
                        onChange={(e) => updateStage(op.id, (e.target.value as Stage) || null)}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">Status</option>
                        <option value="Saved">Saved</option>
                        <option value="Applied">Applied</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Offer">Offer</option>
                      </select>

                      <button
                        onClick={(e) => handleDeleteOpportunity(op.id, e)}
                        disabled={isDeleting}
                        title="Delete Role"
                        className="text-slate-600 hover:text-rose-400 transition p-1"
                      >
                        {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {op.apply_url && (
                        <a
                          href={op.apply_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => {
                            if (!currentStage) updateStage(op.id, "Applied");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-emerald-400 transition flex items-center gap-1 font-medium text-[11px]"
                        >
                          <Send className="w-3 h-3 text-emerald-400" /> Apply
                        </a>
                      )}

                      <button 
                        onClick={() => setActiveDetailModal(op)}
                        className="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 font-semibold cursor-pointer text-xs"
                      >
                        Roadmap <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dynamic Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-800 bg-[#0d1424] hover:bg-slate-800 disabled:opacity-40 text-slate-300 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400 font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-800 bg-[#0d1424] hover:bg-slate-800 disabled:opacity-40 text-slate-300 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      {/* Resume Parser Modal */}
      {isResumeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#0b101c] border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsResumeModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Auto-Calibrate via Resume</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Paste the technical summary or skills section from your resume. OpportunityLens will extract matched technologies and calibrate your diagnostic score automatically.
            </p>

            <textarea
              rows={6}
              placeholder="Paste skills or resume text (e.g., Experienced in React, Next.js, Node.js, building PostgreSQL schemas, and containerizing microservices with Docker...)"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full bg-[#070b12] border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 mb-3"
            />

            {resumeFeedback && (
              <p className="text-xs font-medium text-emerald-300 mb-4 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/50">
                {resumeFeedback}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsResumeModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white px-3 py-2 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleParseResume}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold shadow"
              >
                Extract & Calibrate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Kanban Pipeline Modal */}
      {isTrackerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#0b101c] border border-slate-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsTrackerModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Application Pipeline</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Track the progress of your opportunities through each phase of the hiring process.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(["Saved", "Applied", "Interviewing", "Offer"] as Stage[]).map((col) => {
                const colItems = opportunities.filter(op => stages[op.id] === col);
                return (
                  <div key={col} className="bg-[#070b12] border border-slate-800 rounded-2xl p-4 flex flex-col">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-300">
                      <span>{col}</span>
                      <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full text-[10px] text-emerald-400">
                        {colItems.length}
                      </span>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-96 pr-1">
                      {colItems.length === 0 ? (
                        <p className="text-[11px] text-slate-600 italic py-4 text-center">No roles in this column</p>
                      ) : (
                        colItems.map(item => (
                          <div key={item.id} className="p-3 bg-[#0d1424] border border-slate-800/80 rounded-xl text-xs space-y-1.5">
                            <h4 className="font-bold text-slate-100 line-clamp-1">{item.title}</h4>
                            <p className="text-slate-400 text-[11px]">{item.company}</p>
                            <div className="pt-2 flex justify-between items-center text-[10px]">
                              <select
                                value={col}
                                onChange={(e) => updateStage(item.id, e.target.value as Stage)}
                                className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300"
                              >
                                <option value="Saved">Saved</option>
                                <option value="Applied">Applied</option>
                                <option value="Interviewing">Interviewing</option>
                                <option value="Offer">Offer</option>
                              </select>
                              <button
                                onClick={() => updateStage(item.id, null)}
                                className="text-slate-500 hover:text-rose-400"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Details & Roadmap Modal */}
      {activeDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#0b101c] border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveDetailModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                {activeDetailModal.type}
              </span>
              {activeDetailModal.created_at && (
                <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3" /> {new Date(activeDetailModal.created_at).toLocaleDateString()}
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-white">{activeDetailModal.title}</h2>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 mb-5">
              <span className="flex items-center gap-1 font-medium text-slate-300"><Building2 className="w-3.5 h-3.5 text-emerald-400" /> {activeDetailModal.company}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {activeDetailModal.location}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed mb-6">
              <p className="font-bold text-slate-200 mb-1">Role Description:</p>
              {activeDetailModal.description}
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-400" /> Curated Gap-Closing Roadmap
              </h3>

              {(() => {
                const { score, missing, matched } = calculateMatch(activeDetailModal.required_skills);
                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400">Match Readiness:</span>
                      <span className="font-bold font-mono text-emerald-300">{score}%</span>
                    </div>

                    {missing.length === 0 ? (
                      <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> You meet all technical prerequisites for this position.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {missing.map((skill) => {
                          const res = SKILL_RESOURCES[skill];
                          return (
                            <div key={skill} className="p-3.5 rounded-xl bg-[#070b12] border border-slate-800/80 flex flex-col gap-1.5 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-rose-300 flex items-center gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Missing: {skill}
                                </span>
                                {res && (
                                  <a
                                    href={res.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline underline-offset-2"
                                  >
                                    {res.label} <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                              <p className="text-slate-400 text-[11px] leading-relaxed">
                                {res?.guide || "Master this technology through its documentation to close your qualification gap."}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {matched.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">
                          Verified in your toolbelt:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {matched.map((s) => (
                            <span key={s} className="text-[11px] bg-slate-900 text-slate-300 border border-slate-800 px-2 py-0.5 rounded font-medium">
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between gap-2">
              <button
                onClick={(e) => handleDeleteOpportunity(activeDetailModal.id, e as unknown as React.MouseEvent)}
                className="px-3.5 py-2 rounded-xl border border-rose-900/60 bg-rose-950/40 hover:bg-rose-900/60 text-xs font-semibold text-rose-300 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>

              <div className="flex gap-2">
                {activeDetailModal.apply_url && (
                  <a
                    href={activeDetailModal.apply_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-300 flex items-center gap-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" /> Apply Portal
                  </a>
                )}
                <button
                  onClick={() => setActiveDetailModal(null)}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold shadow"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skill Lens Modal */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#0b101c] border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsSkillModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Calibrate Skill Lens</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Toggle your verified competencies. Real-time match scores and custom gap roadmaps recalculate instantly across all roles.
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {ALL_SKILLS.map((skill) => {
                const isSelected = userSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-emerald-500 border-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                        : "bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    {skill}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-800">
              <button
                onClick={() => setUserSkills([])}
                className="text-xs text-slate-400 hover:text-rose-400 font-medium"
              >
                Clear all
              </button>
              <button
                onClick={() => setIsSkillModalOpen(false)}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold shadow"
              >
                Apply Lens
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Role Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#0b101c] border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsPostModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Post Opportunity</h3>
            <p className="text-xs text-slate-400 mb-5">
              Publish a verified role directly into the PostgreSQL opportunities feed.
            </p>

            <form onSubmit={handleCreateOpportunity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems Fellow"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#070b12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Supabase Labs"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full bg-[#070b12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Remote / Bengaluru"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-[#070b12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Direct Application URL</label>
                <input
                  type="url"
                  placeholder="https://company.com/apply or GitHub repo link"
                  value={newApplyUrl}
                  onChange={(e) => setNewApplyUrl(e.target.value)}
                  className="w-full bg-[#070b12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role Classification</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as Opportunity["type"])}
                  className="w-full bg-[#070b12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Internship">Internship</option>
                  <option value="Open Source">Open Source</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Entry-Level">Entry-Level</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Required Competencies (Select applicable)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-[#070b12] rounded-xl border border-slate-800">
                  {ALL_SKILLS.map((skill) => {
                    const isSelected = newSkills.includes(skill);
                    return (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => {
                          setNewSkills(prev => 
                            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
                          );
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                          isSelected
                            ? "bg-emerald-500 border-emerald-400 text-slate-950 font-bold"
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
                  placeholder="Summary of scope, expectations, and core challenges..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[#070b12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {submitting ? "Publishing..." : "Publish Opportunity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#0b101c] border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              {authMode === "login" ? "Sign In to OpportunityLens" : "Create Developer Account"}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Sync your verified skill profile, pipeline tracking, and opportunities across all devices.
            </p>

            {authError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs">
                {authError}
              </div>
            )}

            <div className="space-y-2 mb-4">
              <button
                type="button"
                onClick={() => handleOAuthLogin("github")}
                className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                Continue with GitHub
              </button>
            </div>

            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-[#0b101c] px-2 text-[10px] text-slate-500 uppercase tracking-wider font-mono absolute">
                or email
              </span>
            </div>

            <form onSubmit={handleAuth} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-[#070b12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-[#070b12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow"
              >
                {authLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {authMode === "login" ? "Sign In" : "Register"}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
              {authMode === "login" ? (
                <button
                  onClick={() => {
                    setAuthMode("signup");
                    setAuthError("");
                  }}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition"
                >
                  Do not have an account? <span className="underline">Sign up</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                  }}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition"
                >
                  Already have an account? <span className="underline">Sign in</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}