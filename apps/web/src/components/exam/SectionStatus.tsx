'use client';

import { useState, useEffect } from 'react';
import { getSession, hasAnySection } from '@/lib/examSession';

export function SectionStatusBadge({
  mockId,
  sectionKey,
}: {
  mockId: string;
  sectionKey: 'listening' | 'reading' | 'sprachbausteine' | 'writing' | 'speaking';
}) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const session = getSession(mockId);
    if (session?.sections[sectionKey]) {
      setDone(true);
    }
  }, [mockId, sectionKey]);

  if (!done) return null;

  return (
    <span
      data-testid={`section-done-${sectionKey}`}
      className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-success text-xs text-white"
      aria-label="Abgeschlossen"
    >
      ✓
    </span>
  );
}

export function SectionActionButton({
  mockId,
  sectionKey,
  href,
  color,
}: {
  mockId: string;
  sectionKey: 'listening' | 'reading' | 'sprachbausteine' | 'writing' | 'speaking';
  href: string;
  color: string;
}) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const session = getSession(mockId);
    if (session?.sections[sectionKey]) {
      setDone(true);
    }
  }, [mockId, sectionKey]);

  return (
    <a
      href={href}
      className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
      style={{ backgroundColor: color }}
    >
      {done ? 'Wiederholen' : 'Starten'}
    </a>
  );
}

export function ViewResultsLink({ mockId }: { mockId: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const session = getSession(mockId);
    if (session && hasAnySection(session)) {
      setShow(true);
    }
  }, [mockId]);

  if (!show) return null;

  return (
    <a
      data-testid="view-results-link"
      href={`/exam/${mockId}/results`}
      className="block w-full rounded-xl border-2 border-brand-primary py-4 text-center text-lg font-semibold text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
    >
      Ergebnisse anzeigen
    </a>
  );
}
