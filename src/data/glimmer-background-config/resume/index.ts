import { GlimmerBackgroundConfig } from '@/components/common/glimmer-background';

const commonConfig: GlimmerBackgroundConfig = {
  animate: 'animate-pulse',
  opacity: 'opacity-30',
  blur: 'blur-3xl',
};

const GlimmerBackgroundConfigs: Array<GlimmerBackgroundConfig> = [
  {
    ...commonConfig,
    size: 'h-96 w-96 lg:h-[55vw] lg:w-[55vw]',
    position: 'top-[-10%] left-[-10%]',
    color: 'bg-blue-200 dark:bg-blue-800/50',
    duration: '[animation-duration:_8000ms]',
    delay: '',
  },
  {
    ...commonConfig,
    size: 'h-96 w-96 lg:h-[50vw] lg:w-[50vw]',
    position: 'top-[-10%] right-[-10%]',
    color: 'bg-purple-200/50 dark:bg-purple-800/50',
    duration: '[animation-duration:_12000ms]',
    delay: 'animate-delay-1000',
  },
  {
    ...commonConfig,
    size: 'h-96 w-96',
    position: 'bottom-[-20%] right-[20%]',
    color: 'bg-pink-200/50 dark:bg-pink-900/30',
    duration: '[animation-duration:_6000ms]',
    delay: 'animate-delay-700',
  },
];

export default GlimmerBackgroundConfigs;
