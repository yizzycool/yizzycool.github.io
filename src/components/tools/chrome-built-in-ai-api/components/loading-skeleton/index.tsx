'use client';

export default function LoadingSkeleton() {
  return (
    <div className="mt-10 flex animate-pulse flex-col items-center px-5 pb-20 text-center">
      {/* <div className="h-6 w-48 max-w-full rounded-full bg-neutral-500/30" /> */}
      <div className="mt-10 h-3 w-96 max-w-full rounded-full bg-neutral-500/30" />
      <div className="mt-3 h-3 w-96 max-w-full rounded-full bg-neutral-500/30" />
      <div className="mt-10 h-60 w-full max-w-screen-sm rounded-lg bg-neutral-500/30" />
    </div>
  );
}
