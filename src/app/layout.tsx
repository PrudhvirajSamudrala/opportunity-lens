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
  title: "OpportunityLens - Autonomous Skill Diagnostic & Career Engine",
  description: "Calibrate skills against live engineering roles with real-time gap roadmaps.",
  verification: {
    google: "ANc7QJjmkyZsXdOxv85HS_oTMtvZdm56gKwgAKofp1A",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="ANc7QJjmkyZsXdOxv85HS_oTMtvZdm56gKwgAKofp1A"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}