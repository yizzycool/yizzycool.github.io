'use client';

import { MapPin } from 'lucide-react';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { cn } from '@/utils/cn';
import ProfileData from './data/profile.json';
import { SocialIcons } from '@/components/shared/social-icons';

export default function HeaderBlock() {
  const { getFadeUpClass } = useGetTransitionClass();

  return (
    <header className="mx-auto mb-20 max-w-screen-xl">
      <div>
        <h1
          className={cn(
            'mb-2 mt-10 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl dark:text-white',
            getFadeUpClass('animate-delay-150')
          )}
        >
          Yi-Dong Wu{' '}
        </h1>
        <h2
          className={cn(
            'mb-6 text-xl font-medium text-indigo-600 md:text-2xl dark:text-indigo-400',
            getFadeUpClass('animate-delay-150')
          )}
        >
          Senior Frontend Engineer
        </h2>
        <div
          className={cn(
            'mb-6 flex items-center gap-1.5 text-sm',
            getFadeUpClass('animate-delay-200')
          )}
        >
          <MapPin size={16} className="text-blue-500" />
          <span>{ProfileData.location}</span>
        </div>
      </div>

      <p
        className={cn(
          'text-base leading-relaxed sm:text-lg',
          getFadeUpClass('animate-delay-250')
        )}
      >
        {ProfileData.summary}
      </p>

      <div
        className={cn(
          'mt-6 flex items-center justify-between',
          getFadeUpClass('animate-delay-300')
        )}
      >
        <SocialIcons
          types={['github', 'linkedin', 'email']}
          transition
          delay="delay-300"
          className="gap-4"
        />
      </div>
    </header>
  );
}
