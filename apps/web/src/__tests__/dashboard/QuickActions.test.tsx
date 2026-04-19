import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuickActions } from '@/components/dashboard/QuickActions';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('QuickActions', () => {
  it('renders all 4 action cards', () => {
    render(<QuickActions continueHref="/exam" />);
    expect(screen.getByTestId('quick-action-start-exam')).toBeInTheDocument();
    expect(screen.getByTestId('quick-action-vocab')).toBeInTheDocument();
    expect(screen.getByTestId('quick-action-grammar')).toBeInTheDocument();
    expect(screen.getByTestId('quick-action-continue')).toBeInTheDocument();
  });

  it('links to correct routes', () => {
    render(<QuickActions continueHref="/exam/A1_mock_03" />);
    expect(screen.getByTestId('quick-action-start-exam')).toHaveAttribute(
      'href',
      '/exam',
    );
    expect(screen.getByTestId('quick-action-vocab')).toHaveAttribute(
      'href',
      '/vocab',
    );
    expect(screen.getByTestId('quick-action-grammar')).toHaveAttribute(
      'href',
      '/grammar',
    );
    expect(screen.getByTestId('quick-action-continue')).toHaveAttribute(
      'href',
      '/exam/A1_mock_03',
    );
  });
});
