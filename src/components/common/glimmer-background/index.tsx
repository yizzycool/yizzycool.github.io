'use client';

import clsx from 'clsx';
import _values from 'lodash/values';

export type GlimmerBackgroundConfig = {
  // Ensure all elements utilize Tailwind CSS classes for styling.
  // e.g. top-10, top-[-10%], etc.
  position?: string;
  // e.g. w-10, w-[30px], etc.
  size?: string;
  // e.g. bg-indigo-200, dark:bg-indigo-900, etc.
  color?: string;
  // e.g. animate-pulse, animate-spin, etc.
  animate?: string;
  // e.g. opacity-30, opacity-[87%], etc.
  opacity?: string;
  // e.g. duration-200, [animation-duration:_4000ms], etc.
  duration?: string;
  // e.g. blur-3xl, blur-[10px], etc.
  blur?: string;
  // e.g. delay-700, [animation-delay:_4000ms], etc.
  delay?: string;
  // other tailwindcss classname
  className?: string;
};

type Props = {
  configs: Array<GlimmerBackgroundConfig>;
};

export default function GlimmerBackground({ configs = [{}] }: Props) {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      aria-hidden
    >
      {configs.map((config, idx) => (
        <div
          key={idx}
          className={clsx(
            'absolute rounded-full mix-blend-multiply',
            ..._values(config)
          )}
        />
      ))}
    </div>
  );
}
