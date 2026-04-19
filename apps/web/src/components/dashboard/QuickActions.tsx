'use client';

import Link from 'next/link';

interface QuickActionsProps {
  continueHref: string;
}

const ACTIONS = [
  {
    key: 'start-exam',
    href: '/exam',
    title: 'Übungstest starten',
    description: 'Vollständiger Übungstest mit allen Sektionen',
    icon: '📝',
  },
  {
    key: 'vocab',
    href: '/vocab',
    title: 'Vokabeln üben',
    description: 'Karteikarten mit SM-2 Wiederholung',
    icon: '📚',
  },
  {
    key: 'grammar',
    href: '/grammar',
    title: 'Grammatik',
    description: 'Themen mit Übungen und Beispielen',
    icon: '📖',
  },
] as const;

export function QuickActions({ continueHref }: QuickActionsProps) {
  return (
    <div
      data-testid="quick-actions"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {ACTIONS.map((action) => (
        <Link
          key={action.key}
          href={action.href}
          data-testid={`quick-action-${action.key}`}
          className="flex gap-3 rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-md"
        >
          <span className="text-2xl" role="img" aria-hidden>
            {action.icon}
          </span>
          <div>
            <div className="font-semibold text-text-primary">{action.title}</div>
            <div className="mt-1 text-sm text-text-secondary">
              {action.description}
            </div>
          </div>
        </Link>
      ))}
      <Link
        href={continueHref}
        data-testid="quick-action-continue"
        className="flex gap-3 rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-md"
      >
        <span className="text-2xl" role="img" aria-hidden>
          ▶️
        </span>
        <div>
          <div className="font-semibold text-text-primary">Weiter lernen</div>
          <div className="mt-1 text-sm text-text-secondary">
            Dort weitermachen, wo du aufgehört hast
          </div>
        </div>
      </Link>
    </div>
  );
}
