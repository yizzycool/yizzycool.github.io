export const revealSectionBaseStyles =
  'transform transition-all duration-1000 ease-out';

export const getRevealSectionVisibilityStyles = (isVisible: boolean) =>
  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0';
