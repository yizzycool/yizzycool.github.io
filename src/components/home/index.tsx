'use client';

import type { BlogMediaData } from '@/types/blog/media';

import { MoveRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/utils/cn';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { SocialIcons } from '@/components/shared/social-icons';
import { ResponsiveStrapiImage } from '@/components/shared/responsive-strapi-image';

import Typewritter from './typewriter';

type Props = {
  avatar?: BlogMediaData | null;
};

export default function Home({ avatar = null }: Props) {
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const { getFadeUpClass } = useGetTransitionClass();

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    if (img.complete && img.naturalWidth > 0) {
      // Image is in Cache
      setAvatarLoaded(true);
    }
  }, []);

  return (
    <main className="relative flex min-h-[100dvh] w-full pt-[101px]">
      <div
        className={cn(
          'relative mx-auto min-h-full w-full max-w-screen-2xl',
          'px-4 pb-8 lg:px-20',
          'flex flex-col'
        )}
      >
        {/* Hero Welcome Section */}
        <div className="grid flex-1 grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left Column */}
          <div className="order-2 flex flex-col items-center space-y-8 text-center lg:order-1 lg:items-start lg:text-left">
            {/* Status Badge */}
            <div
              className={cn(
                'inline-flex items-center rounded-full border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest',
                'border-neutral-200/90 bg-white/70 text-slate-600',
                'transition-colors duration-200 hover:border-neutral-300',
                'dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-slate-300 dark:hover:border-neutral-700',
                getFadeUpClass('animate-delay-100')
              )}
            >
              COFFEE, CODE &amp; CHILL
            </div>

            {/* Headlines */}
            <div className="flex w-full flex-col items-center space-y-4 lg:items-start">
              <h1
                className={cn(
                  'text-4xl font-black tracking-tight text-slate-900 md:text-5xl lg:text-7xl dark:text-white',
                  getFadeUpClass('animate-delay-200')
                )}
              >
                Hi There, <br />I am Yizzy
                <span className="text-sky-500">.</span>
              </h1>

              <div
                className={cn(
                  'flex h-12 items-center justify-center font-mono text-xl font-medium tracking-tight text-slate-500 md:text-2xl lg:justify-start dark:text-slate-300',
                  getFadeUpClass('animate-delay-300')
                )}
              >
                <Typewritter />
              </div>
            </div>

            {/* Description */}
            <p
              className={cn(
                'max-w-xl text-[17px] font-light leading-relaxed text-slate-600/90 dark:text-slate-400/90',
                getFadeUpClass('animate-delay-500')
              )}
            >
              Crafting clean, efficient front-end experiences with{' '}
              <strong className="font-semibold text-slate-800 dark:text-slate-200">
                Next.js
              </strong>{' '}
              and{' '}
              <strong className="font-semibold text-slate-800 dark:text-slate-200">
                React
              </strong>
              , while keeping a relaxed lifestyle. Focus on UI/UX detail and
              clean code.
            </p>

            {/* CTA Buttons */}
            <div
              className={cn(
                'flex flex-wrap justify-center gap-4 pt-4 lg:justify-start',
                getFadeUpClass('animate-delay-[600ms]')
              )}
            >
              <Link
                href="/tools"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 active:scale-[0.98] dark:bg-white dark:text-slate-950 dark:hover:bg-neutral-200"
              >
                Explore Tools <MoveRight />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200/90 bg-white/60 px-6 py-3.5 text-sm font-semibold text-slate-700 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-white dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-slate-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
              >
                Read Blog
              </Link>
            </div>

            {/* Social Links */}
            <SocialIcons
              types={['github', 'linkedin']}
              transition
              delay="animate-delay-1000"
              className="justify-center pt-8 lg:justify-start"
            />
          </div>

          {/* Right Column - Avatar */}
          <div
            className={cn(
              'relative order-1 flex justify-center lg:order-2 lg:justify-end',
              getFadeUpClass('animate-delay-500')
            )}
          >
            <div className="group relative">
              {/* Offset Border */}
              <div
                className={cn(
                  'absolute left-4 top-4 h-full w-full rounded-2xl border-2 border-neutral-300 dark:border-neutral-700',
                  'transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2'
                )}
              />

              {/* Image Card */}
              <div
                className={cn(
                  'relative h-72 w-72 overflow-hidden rounded-2xl border-2 border-neutral-900 bg-white shadow-2xl md:h-96 md:w-96 dark:border-white dark:bg-neutral-900',
                  'transition-transform duration-500 hover:-translate-y-2'
                )}
              >
                <ResponsiveStrapiImage
                  ref={imgRef}
                  media={avatar}
                  priority
                  sizes="(max-width: 768px) 288px, 384px"
                  alt={avatar?.alternativeText || 'Yizzy avatar'}
                  objectFit="contain"
                  rounded="base"
                  className={cn(
                    'm-auto h-full w-full object-center',
                    'group-hover:contrast-110 transition-all duration-500 ease-in-out group-hover:scale-110',
                    avatarLoaded ? 'opacity-100' : 'opacity-0'
                  )}
                  onLoad={() => setAvatarLoaded(true)}
                  fallback={
                    <Image
                      priority
                      fetchPriority="high"
                      loading="eager"
                      className={cn(
                        'm-auto rounded object-contain object-center',
                        'group-hover:contrast-110 transition-all duration-500 ease-in-out group-hover:scale-110'
                      )}
                      width={500}
                      height={500}
                      src="/assets/images/home/avatar.jpg"
                      alt="Yizzy avatar"
                    />
                  }
                />
              </div>

              {/* Top Right gogogo */}
              <div
                className={cn(
                  'pointer-events-none absolute -right-12 -top-16 z-20 opacity-0',
                  'transition-all duration-300 group-hover:-translate-y-2 group-hover:translate-x-2 group-hover:opacity-100'
                )}
              >
                <Image
                  width={200}
                  height={200}
                  src="/assets/images/home/gogogo_vertical.svg"
                  alt="gogogo"
                  className="object-contain object-center"
                />
              </div>

              {/* Bottom Left gogogo */}
              <div className="pointer-events-none absolute -bottom-14 -left-16 z-20 opacity-0 transition-all duration-300 group-hover:-translate-x-2 group-hover:translate-y-2 group-hover:opacity-100">
                <Image
                  width={200}
                  height={200}
                  src="/assets/images/home/gogogo_horizontal.svg"
                  alt="gogogo"
                  className="object-contain object-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Hint */}
        <div
          className={cn(
            'mt-20 w-full text-center lg:mt-12',
            getFadeUpClass('animate-delay-[1200ms]')
          )}
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-slate-400">
            Tools & Tech for Modern Frontend
          </p>
          <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-neutral-400 to-transparent" />
        </div>
      </div>
    </main>
  );
}
