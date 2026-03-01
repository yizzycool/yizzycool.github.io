import { GlimmerBackgroundConfig } from '@/components/common/glimmer-background';

const commonConfig: GlimmerBackgroundConfig = {
  animate: 'animate-pulse',
  opacity: 'opacity-30',
  blur: 'blur-3xl',
};

const GlimmerBackgroundConfigs: Array<GlimmerBackgroundConfig> = [
  {
    ...commonConfig,
    size: 'h-96 w-96 lg:h-[45vw] lg:w-[45vw]',
    position: 'top-[-10%] left-[-10%]',
    color: 'bg-blue-200 dark:bg-blue-800/50',
    duration: '[animation-duration:_8000ms]',
    delay: '',
  },
  {
    ...commonConfig,
    size: 'h-96 w-96 lg:h-[35vw] lg:w-[35vw]',
    position: 'top-[-5%] right-[0%]',
    color: 'bg-purple-200/50 dark:bg-purple-800/30',
    duration: '[animation-duration:_12000ms]',
    delay: 'animate-delay-1000',
  },
  {
    ...commonConfig,
    size: 'h-96 w-96 lg:h-[35vw] lg:w-[35vw]',
    position: 'bottom-[-10%] right-[10%]',
    color: 'bg-violet-200/50 dark:bg-violet-700/20',
    duration: '[animation-duration:_6000ms]',
    delay: 'animate-delay-700',
  },
];

export default GlimmerBackgroundConfigs;
