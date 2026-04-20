import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="de">
      <body className="min-h-screen bg-[#f5f5f5] antialiased">
        <div className="flex min-h-screen flex-col">
          <NavHeader />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

function NavHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e0e0e0] bg-white/95 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-brand-primary">Fastrack</span>
          <span className="text-lg font-medium text-text-secondary">
            Deutsch
          </span>
        </a>

        <div className="hidden items-center gap-6 sm:flex">
          <NavLink href="/">Dashboard</NavLink>
          <NavLink href="/exam">Mock Exams</NavLink>
          <NavLink href="/vocab">Vocabulary</NavLink>
          <NavLink href="/grammar">Grammar</NavLink>
        </div>

        {/* Mobile hamburger placeholder */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-text-secondary hover:bg-surface-container sm:hidden"
          aria-label="Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
      </nav>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="text-sm font-medium text-text-secondary transition-colors hover:text-brand-primary"
    >
      {children}
    </a>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#e0e0e0] bg-white py-6">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-text-secondary sm:px-6 lg:px-8">
        Fastrack Deutsch — telc exam prep. Offline-first, content-driven.
      </div>
    </footer>
  );
}
