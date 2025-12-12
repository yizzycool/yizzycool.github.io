import { GlimmerBackgroundConfig } from '@/components/common/glimmer-background';

const commonConfig: GlimmerBackgroundConfig = {
  size: 'w-96 h-96',
  animate: 'animate-pulse',
  opacity: 'opacity-30',
  blur: 'blur-3xl',
};

const GlimmerBackgroundConfigs: Array<GlimmerBackgroundConfig> = [
  {
    ...commonConfig,
    position: 'top-[-10%] left-[-10%]',
    color: 'bg-indigo-200 dark:bg-indigo-900',
    duration: '[animation-duration:_4000ms]',
    delay: '',
  },
  {
    ...commonConfig,
    position: 'top-[-10%] right-[-10%]',
    color: 'bg-purple-200 dark:bg-purple-900',
    duration: '[animation-duration:_5000ms]',
    delay: 'delay-1000',
  },
  {
    ...commonConfig,
    position: 'bottom-[-20%] left-[20%]',
    color: 'bg-pink-200 dark:bg-pink-900',
    duration: '[animation-duration:_6000ms]',
    delay: 'delay-700',
  },
];

export default GlimmerBackgroundConfigs;
