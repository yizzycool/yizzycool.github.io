'use client';

import clsx from 'clsx';
import {
  Code2,
  Github,
  Layers,
  LayoutTemplate,
  Linkedin,
  Terminal,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Typewritter from './components/typewriter';
import Badge from '@/components/common/badge';
import SocialIcon from '@/components/common/social-icon';

const TechStacks = [
  {
    label: 'Next.js',
    icon: Code2,
  },
  {
    label: 'TailwindCSS',
    icon: Layers,
  },
  {
    label: 'RWD',
    icon: LayoutTemplate,
  },
  {
    label: 'TypeScript',
    icon: Terminal,
  },
];

export default function Intro() {
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getTransitionClass = (delay = 'delay-0') =>
    clsx(
      'transition-all duration-1000 ease-out transform',
      mounted && avatarLoaded
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-12',
      delay
    );

  return (
    <div className="relative flex min-h-full w-full">
      <div className="relative mx-auto my-auto h-full max-w-screen-2xl px-4 pb-20 pt-32 lg:px-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left Column */}
          <div className="order-2 flex flex-col items-center space-y-8 text-center lg:order-1 lg:items-start lg:text-left">
            {/* Status Badge */}
            <Badge
              variant="success"
              bordered={true}
              className={`uppercase ${getTransitionClass('delay-100')}`}
            >
              <span className="relative mr-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>
              {/* Up for a Chat */}
              Chill Mode Activated
            </Badge>

            {/* Headlines */}
            <div className="flex w-full flex-col items-center space-y-4 lg:items-start">
              <h2
                className={clsx(
                  'text-4xl font-extrabold tracking-tight text-neutral-900 md:text-5xl lg:text-7xl dark:text-white',
                  getTransitionClass('delay-200')
                )}
              >
                Hi There, <br />I am{' '}
                <span className="bg-gradient-to-r from-neutral-500 to-neutral-800 bg-clip-text text-transparent dark:from-neutral-400 dark:to-neutral-100">
                  Yizzy.
                </span>
              </h2>

              <div
                className={clsx(
                  'flex h-12 items-center justify-center text-xl font-medium text-neutral-500 md:text-2xl lg:justify-start dark:text-neutral-400',
                  getTransitionClass('delay-300')
                )}
              >
                <Typewritter />
              </div>
            </div>

            {/* Description */}
            <p
              className={clsx(
                'max-w-lg text-lg leading-relaxed text-neutral-600 dark:text-neutral-400',
                getTransitionClass('delay-500')
              )}
            >
              Crafting clean, efficient front-end experiences with Next.js and
              React, while keeping a relaxed lifestyle. Focus on UI/UX detail
              and clean code.
            </p>

            {/* Tech Stack */}
            <div
              className={clsx(
                'flex flex-wrap justify-center gap-3 lg:justify-start',
                getTransitionClass('delay-700')
              )}
            >
              {TechStacks.map(({ label, icon }) => (
                <Badge
                  key={label}
                  icon={icon}
                  variant="neutral"
                  size="sm"
                  bordered={true}
                  className="hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                  {label}
                </Badge>
              ))}
            </div>

            {/* Social Links */}
            <div
              className={clsx(
                'flex justify-center gap-2 pt-8 lg:justify-start',
                getTransitionClass('delay-[1200ms]')
              )}
            >
              <SocialIcon icon={Github} href="https://github.com/yizzycool" />
              <SocialIcon
                icon={Linkedin}
                href="https://www.linkedin.com/in/yizzy/"
              />
            </div>
          </div>
          {/* Right Column - Avatar */}
          <div
            className={clsx(
              'relative order-1 flex justify-center lg:order-2 lg:justify-end',
              getTransitionClass('delay-500')
            )}
          >
            <div className="group relative">
              {/* Offset Border */}
              <div
                className={clsx(
                  'absolute left-4 top-4 h-full w-full rounded-2xl border-2 border-neutral-300 dark:border-neutral-700',
                  'transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2'
                )}
              />

              {/* Image Card */}
              <div
                className={clsx(
                  'relative h-72 w-72 overflow-hidden rounded-2xl border-2 border-neutral-900 bg-white shadow-2xl md:h-96 md:w-96 dark:border-white dark:bg-neutral-900',
                  'transition-transform duration-500 hover:-translate-y-2'
                )}
              >
                <Image
                  priority={true}
                  className={clsx(
                    'm-auto rounded',
                    'group-hover:contrast-110 transition-all duration-500 ease-in-out group-hover:scale-110',
                    avatarLoaded ? 'opacity-100' : 'opacity-0'
                  )}
                  width={500}
                  height={500}
                  src="/assets/images/home/avatar.jpg"
                  alt="main image"
                  objectFit="contain"
                  objectPosition="center"
                  onLoadingComplete={() => setAvatarLoaded(true)}
                />
              </div>

              {/* Top Right gogogo */}
              <div
                className={clsx(
                  'pointer-events-none absolute -right-12 -top-16 z-20 opacity-0',
                  'transition-all duration-300 group-hover:-translate-y-2 group-hover:translate-x-2 group-hover:opacity-100'
                )}
              >
                <Image
                  priority={true}
                  width={200}
                  height={200}
                  src="/assets/images/home/gogogo_vertical.svg"
                  alt="gogogo"
                  objectFit="contain"
                  objectPosition="center"
                />
              </div>

              {/* Bottom Left gogogo */}
              <div className="pointer-events-none absolute -bottom-14 -left-16 z-20 opacity-0 transition-all duration-300 group-hover:-translate-x-2 group-hover:translate-y-2 group-hover:opacity-100">
                <Image
                  priority={true}
                  width={200}
                  height={200}
                  src="/assets/images/home/gogogo_horizontal.svg"
                  alt="gogogo"
                  objectFit="contain"
                  objectPosition="center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Hint */}
        <div
          className={clsx(
            'mt-12 w-full text-center',
            getTransitionClass('delay-[1500ms]')
          )}
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-neutral-400">
            Tools & Tech for Modern Frontend
          </p>
          <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-neutral-400 to-transparent" />
        </div>
      </div>
    </div>
  );
}
