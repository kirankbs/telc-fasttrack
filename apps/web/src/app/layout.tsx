import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { FeedbackFAB } from "@/components/FeedbackFAB";
import { NavHeader } from "@/components/NavHeader";

const sans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans-var",
  display: "swap",
});

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
  variable: "--font-display-var",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mono-var",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fastrack Deutsch — German Exam Prep",
  description:
    "Spend X hours. Pass the telc exam. Practice mock exams, vocabulary, and grammar for telc A1 through C1.",
  openGraph: {
    title: "Fastrack Deutsch — German Exam Prep",
    description:
      "Spend X hours. Pass the telc exam. Practice mock exams, vocabulary, and grammar for telc A1 through C1.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="de"
      className={`${sans.variable} ${display.variable} ${mono.variable}`}
    >
      <body className="min-h-screen bg-background antialiased">
        <div className="flex min-h-screen flex-col">
          <NavHeader />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
          <Footer />
        </div>
        <FeedbackFAB />
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-surface py-6">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-text-secondary sm:px-6 lg:px-8">
        Fastrack Deutsch — telc exam prep. Offline-first, content-driven.
      </div>
    </footer>
  );
}
