export type SocialIconType = 'github' | 'linkedin' | 'email';

/**
 * Props for the SocialIcons link row component.
 */
export type SocialIconsProps = {
  /** List of social icon types to render (e.g. ['github', 'linkedin', 'email']) */
  types: Array<SocialIconType>;
  /** Whether to animate icons with enter transitions */
  transition?: boolean;
  /** Transition delay string (e.g. 'delay-100') */
  delay?: string;
  /** Additional CSS class names for the container */
  className?: string;
  /** Size of each icon in pixels */
  iconSize?: number;
};
