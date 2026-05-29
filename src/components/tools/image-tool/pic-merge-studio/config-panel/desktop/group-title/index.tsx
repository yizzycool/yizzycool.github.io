'use client';

export default function GroupTitle({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4 pt-8">
      <h3 className="whitespace-nowrap text-sm font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-white">
        {text}
      </h3>
      <div className="h-px w-full bg-neutral-200 dark:bg-neutral-700" />
    </div>
  );
}
