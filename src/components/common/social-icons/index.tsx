'use client';

import clsx from 'clsx';
import { Github, Linkedin, Mail } from 'lucide-react';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import SocialIcon from '../social-icon';

type SocialIconType = 'github' | 'linkedin' | 'email';

type Props = {
  types: Array<SocialIconType>;
  // customize
  transition?: boolean;
  delay?: string;
  className?: string;
  // icon suctomize
  iconSize?: number;
};

const IconMap = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
};

const HrefMap = {
  github: 'https://github2.com/yizzycool',
  linkedin: 'https://www.linkedin.com/in/yizzy/',
  email: 'mailto:chsh110768@gmail.com',
};

export default function SocialIcons({
  types = [],
  transition = false,
  delay = 'delay-0',
  className = '',
  iconSize = 20,
}: Props) {
  const { getSlideUpClass } = useGetTransitionClass();

  return (
    <div
      className={clsx(
        'flex flex-wrap gap-2',
        transition && getSlideUpClass(delay),
        className
      )}
    >
      {types.map((type) => (
        <SocialIcon
          key={type}
          icon={IconMap[type]}
          href={HrefMap[type]}
          size={iconSize}
        />
      ))}
    </div>
  );
}
