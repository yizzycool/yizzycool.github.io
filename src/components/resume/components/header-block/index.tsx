'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';
import SocialIcon from '@/components/common/social-icon';

export default function HeaderBlock() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getTransitionClass = (delay = 'delay-0') =>
    clsx(
      'transition-all duration-1000 ease-out transform',
      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12',
      delay
    );

  return (
    <header>
      <h1
        className={clsx(
          'text-center md:text-left',
          'bg-clip-text pb-4 text-4xl font-extrabold tracking-tight text-transparent md:text-6xl',
          'bg-gradient-to-r from-neutral-900 to-neutral-500',
          'dark:from-neutral-100 dark:to-neutral-500',
          getTransitionClass('delay-100')
        )}
      >
        Senior Front-end Engineer
      </h1>
      <div
        className={clsx(
          'text-center md:text-left',
          'max-w-2xl text-lg leading-relaxed text-neutral-600 md:text-xl dark:text-neutral-400',
          getTransitionClass('delay-200')
        )}
      >
        Front-end engineer specializing in React, Next.js, and clean, modern UI.
        I build responsive, scalable interfaces with a strong focus on user
        experience.
      </div>

      <div
        className={clsx(
          'mt-6 flex flex-wrap justify-center gap-4 md:justify-start',
          getTransitionClass('delay-300')
        )}
      >
        <SocialIcon icon={Github} href="https://github.com/yizzycool" />
        <SocialIcon icon={Linkedin} href="https://www.linkedin.com/in/yizzy/" />
        <SocialIcon icon={Mail} href="mailto:chsh110768@gmail.com" />
      </div>
    </header>
  );
}
