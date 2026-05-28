'use client';

import { MoveRight } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/utils/cn';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import SocialIcons from '@/components/common/social-icons';
import Typewritter from './components/typewriter';

export default function Home() {
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  const { getFadeUpClass } = useGetTransitionClass();

  return (
    <main className="relative flex min-h-full w-full">
      <div className="relative mx-auto my-auto h-full w-full max-w-screen-2xl px-4 pb-20 pt-32 lg:px-20">
        {/* Hero Welcome Section */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left Column */}
          <div className="order-2 flex flex-col items-center space-y-8 text-center lg:order-1 lg:items-start lg:text-left">
            {/* Status Badge */}
            <div
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest',
                'rounded-full border',
                'border-indigo-100/80 dark:border-indigo-900/40',
                'bg-indigo-50/50 dark:bg-indigo-950/30',
                'text-indigo-600 dark:text-indigo-300',
                'shadow-sm shadow-indigo-100/30 dark:shadow-none',
                'transition-all duration-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50',
                getFadeUpClass('animate-delay-100')
              )}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
              </span>
              COFFEE, CODE & CHILL
            </div>

            {/* Headlines */}
            <div className="flex w-full flex-col items-center space-y-4 lg:items-start">
              <h2
                className={cn(
                  'text-4xl font-black tracking-tight text-neutral-900 md:text-5xl lg:text-7xl dark:text-white',
                  getFadeUpClass('animate-delay-200')
                )}
              >
                Hi There, <br />I am{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                  Yizzy.
                </span>
              </h2>

              <div
                className={cn(
                  'flex h-12 items-center justify-center font-mono text-xl font-semibold tracking-tight text-neutral-800 md:text-2xl lg:justify-start dark:text-neutral-100',
                  getFadeUpClass('animate-delay-300')
                )}
              >
                <Typewritter />
              </div>
            </div>

            {/* Description */}
            <p
              className={cn(
                'max-w-xl text-[17px] font-light leading-relaxed text-neutral-600/90 dark:text-neutral-400/90',
                getFadeUpClass('animate-delay-500')
              )}
            >
              Crafting clean, efficient front-end experiences with{' '}
              <strong className="font-semibold text-neutral-800 dark:text-neutral-200">
                Next.js
              </strong>{' '}
              and{' '}
              <strong className="font-semibold text-neutral-800 dark:text-neutral-200">
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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:from-indigo-500 hover:to-purple-500 hover:shadow-xl hover:shadow-indigo-500/35 active:scale-[0.98]"
              >
                Explore Tools <MoveRight />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200/80 bg-white/20 px-6 py-3.5 text-sm font-semibold text-neutral-700 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/60 dark:border-neutral-800/80 dark:bg-neutral-900/20 dark:text-neutral-300 dark:hover:bg-neutral-900/60"
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
                <Image
                  priority
                  fetchPriority="high"
                  loading="eager"
                  className={cn(
                    'm-auto rounded object-contain object-center',
                    'group-hover:contrast-110 transition-all duration-500 ease-in-out group-hover:scale-110',
                    avatarLoaded ? 'opacity-100' : 'opacity-0'
                  )}
                  width={500}
                  height={500}
                  src="/assets/images/home/avatar.jpg"
                  alt="main image"
                  onLoad={() => setAvatarLoaded(true)}
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
            'mt-32 w-full text-center',
            getFadeUpClass('animate-delay-[1200ms]')
          )}
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-neutral-400">
            Tools & Tech for Modern Frontend
          </p>
          <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-neutral-400 to-transparent" />
        </div>
      </div>
    </main>
  );
}
