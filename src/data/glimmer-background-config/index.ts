import { GlimmerBackgroundConfig } from '@/components/ui/glimmer-background';

const GlimmerBackgroundConfigs: Array<GlimmerBackgroundConfig> = [
  {
    size: 'h-96 w-96 lg:h-[45vw] lg:w-[45vw]',
    position: 'top-[-10%] left-[-10%]',
    color: 'bg-blue-200 dark:bg-blue-800/50',
    opacity: 'opacity-30',
    blur: 'blur-3xl',
  },
  {
    size: 'h-96 w-96 lg:h-[35vw] lg:w-[35vw]',
    position: 'bottom-[-10%] right-[5%]',
    color: 'bg-teal-200/50 dark:bg-teal-700/25',
    opacity: 'opacity-30',
    blur: 'blur-3xl',
  },
];

export default GlimmerBackgroundConfigs;
