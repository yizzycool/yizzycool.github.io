import { Lightbulb } from 'lucide-react';

export default function Tip() {
  return (
    <div className="flex items-start gap-3 text-left">
      <div className="shrink-0 rounded-lg bg-yellow-100 p-2 text-yellow-600 dark:bg-yellow-900/30">
        <Lightbulb size={18} />
      </div>
      <div>
        <h4 className="mb-1 text-sm font-semibold">Tips</h4>
        <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          For best results in the Detector, ensure the subject is well-lit and
          centered.
        </p>
      </div>
    </div>
  );
}
