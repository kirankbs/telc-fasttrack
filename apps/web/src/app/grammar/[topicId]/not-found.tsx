import Link from 'next/link';

export default function TopicNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h1 className="text-2xl font-bold text-text-primary">
        Topic not found
      </h1>
      <p className="mt-2 text-text-secondary">
        The grammar topic you are looking for does not exist.
      </p>
      <Link
        href="/grammar"
        className="mt-6 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-light"
      >
        Back to Grammar
      </Link>
    </div>
  );
}
