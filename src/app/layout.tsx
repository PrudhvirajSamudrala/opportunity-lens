import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpportunityLens — AI Skill Diagnostic & Opportunity Engine",
  description: "Match your technical competencies against engineering roles, hackathons, and open source repositories with curated learning gap roadmaps.",
  metadataBase: new URL("https://opportunity-lens-ivory.vercel.app"),
  openGraph: {
    title: "OpportunityLens — AI Skill Diagnostic & Career Matching",
    description: "Discover verified engineering roles matched to your actual tech stack. Close skill gaps instantly with curated official learning tracks.",
    url: "https://opportunity-lens-ivory.vercel.app",
    siteName: "OpportunityLens",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpportunityLens — AI Skill Diagnostic",
    description: "Autonomous career matching and real-time gap analysis for software engineers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#070b12] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200`}>
        {children}
      </body>
    </html>
  );
}