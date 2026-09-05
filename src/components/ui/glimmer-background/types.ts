export type GlimmerBackgroundConfig = {
  position?: string;
  size?: string;
  color?: string;
  animate?: string;
  opacity?: string;
  duration?: string;
  blur?: string;
  delay?: string;
  className?: string;
};

export type GlimmerBackgroundProps = {
  configs?: Array<GlimmerBackgroundConfig>;
};
