export default function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-neutral-200 p-6">
      <div className="h-16 w-16 rounded-full bg-neutral-200" />
      <div className="mt-4 h-3 w-20 rounded bg-neutral-200" />
      <div className="mt-2 h-3 w-32 rounded bg-neutral-200" />
      <div className="mt-3 h-5 w-full rounded bg-neutral-200" />
      <div className="mt-2 h-5 w-3/4 rounded bg-neutral-200" />
      <div className="mt-4 h-16 w-full rounded bg-neutral-200" />
      <div className="mt-4 h-9 w-full rounded-lg bg-neutral-200" />
    </div>
  );
}