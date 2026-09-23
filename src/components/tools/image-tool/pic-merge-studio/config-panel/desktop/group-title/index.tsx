import { Separator } from '@/components/ui/separator';

export default function GroupTitle({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4 pt-8">
      <h3 className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        {text}
      </h3>
      <Separator />
    </div>
  );
}
