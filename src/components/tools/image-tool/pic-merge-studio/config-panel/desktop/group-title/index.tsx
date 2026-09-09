import { Separator } from '@/components/ui/separator';

export default function GroupTitle({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4 pt-8">
      <h3 className="whitespace-nowrap text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">
        {text}
      </h3>
      <Separator />
    </div>
  );
}
