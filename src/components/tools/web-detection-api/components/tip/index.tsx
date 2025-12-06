import Card from '@/components/common/card';
import { Command } from 'lucide-react';

export default function Tip() {
  return (
    <Card className="w-fit" animation="fade-in">
      <div className="flex items-start gap-3 text-left">
        <div className="shrink-0 rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30">
          <Command size={18} />
        </div>
        <div>
          <h4 className="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-100">
            Pro Tip
          </h4>
          <p className="text-xs leading-relaxed text-blue-700 dark:text-blue-300">
            For best results in the Detector, ensure the subject is well-lit and
            centered.
          </p>
        </div>
      </div>
    </Card>
  );
}
