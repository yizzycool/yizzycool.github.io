import type { SocialIconType } from './types';
import type { LucideIcon } from 'lucide-react';
import { Github, Linkedin, Mail } from 'lucide-react';

export const socialIconMap: Record<SocialIconType, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
};

export const socialHrefMap: Record<SocialIconType, string> = {
  github: 'https://github.com/yizzycool',
  linkedin: 'https://www.linkedin.com/in/yizzy/',
  email: 'mailto:chsh110768@gmail.com',
};
