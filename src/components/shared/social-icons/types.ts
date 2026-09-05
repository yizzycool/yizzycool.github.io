export type SocialIconType = 'github' | 'linkedin' | 'email';

export type SocialIconsProps = {
  types: Array<SocialIconType>;
  transition?: boolean;
  delay?: string;
  className?: string;
  iconSize?: number;
};
