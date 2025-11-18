'use client';

import Image from 'next/image';
import Typewritter from '../typewriter';
import { useState } from 'react';
import clsx from 'clsx';

export default function Intro() {
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  return (
    <div
      className={clsx(
        'relative flex min-h-full w-full bg-cover bg-center bg-no-repeat pt-[68px]',
        'bg-gradient-to-b lg:bg-gradient-to-r',
        'from-white to-white',
        'dark:from-neutral-900 dark:to-neutral-500'
      )}
    >
      <div className="absolute left-0 top-0 z-0 h-full w-full bg-transparent dark:bg-neutral-800/70" />
      <div className="relative z-[1] mx-auto my-auto h-full max-w-screen-2xl px-4 py-8">
        <div className="grid h-full w-full grid-cols-1 gap-4 lg:grid-cols-2">
          <div
            className={clsx(
              'order-last mx-auto py-8 text-center text-sky-950',
              'lg:order-none lg:m-auto lg:pl-[15%] lg:text-left dark:text-white'
            )}
          >
            <h1
              className={clsx(
                'text-5xl font-black leading-snug tracking-normal',
                'xl:text-6xl xl:leading-loose xl:tracking-wide'
              )}
            >
              Tools & Tech for Modern Frontend.
            </h1>
            <Typewritter />
          </div>
          <div className="m-auto w-fit">
            <Image
              priority={true}
              className={clsx(
                'm-auto w-[60%] rounded',
                'transition-opacity duration-1000 ease-in-out',
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
        </div>
      </div>
    </div>
  );
}
