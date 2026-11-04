import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const REMOTIVE_API_URL = "https://remotive.com/api/remote-jobs?category=software-dev&limit=15";

const SKILL_KEYWORDS = [
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

interface RemotiveJob {
  id?: number;
  title?: string;
  company_name?: string;
  job_type?: string;
  candidate_required_location?: string;
  description?: string;
  tags?: string[];
  url?: string;
}

function extractSkills(text: string): string[] {
  const found: string[] = [];
  const lower = text.toLowerCase();

  for (const skill of SKILL_KEYWORDS) {
    if (lower.includes(skill.toLowerCase())) {
      found.push(skill);
    }
  }

  if (found.length === 0) {
    return ["JavaScript", "Git", "REST APIs"];
  }

  return Array.from(new Set(found));
}

export async function GET() {
  try {
    const res = await fetch(REMOTIVE_API_URL, {
      headers: { "User-Agent": "OpportunityLens-JobSync/1.0" },
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch from external feed" }, { status: 502 });
    }

    const json = (await res.json()) as { jobs?: RemotiveJob[] };
    const jobs = json.jobs || [];

    const formattedRecords = jobs.map((job: RemotiveJob) => {
      const combinedText = `${job.title ?? ""} ${job.description ?? ""} ${job.tags?.join(" ") ?? ""}`;
      const skills = extractSkills(combinedText);

      return {
        title: job.title || "Software Engineering Role",
        company: job.company_name || "Tech Company",
        type: job.job_type === "full_time" ? "Entry-Level" : "Internship",
        location: job.candidate_required_location || "Remote",
        required_skills: skills,
        description: (job.description || "Exciting engineering role working on modern web stacks.")
          .replace(/<[^>]*>/g, "")
          .slice(0, 300) + "...",
        apply_url: job.url || "https://remotive.com"
      };
    });

    const { error } = await supabase
      .from("opportunities")
      .insert(formattedRecords);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      synced_count: formattedRecords.length,
      sample_role: formattedRecords[0]?.title
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}