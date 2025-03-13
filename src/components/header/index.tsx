'use client';

import clsx from 'clsx';
import HeaderDesktop from './components/desktop';
import HeaderMobile from './components/mobile';

export default function Header() {
  return (
    <div
      className={clsx(
        'fixed top-0 z-10 w-full bg-white/95 backdrop-blur',
        'supports-backdrop-blur:bg-white/60',
        'border-neutral-400/20 lg:border-b dark:bg-neutral-900/60'
      )}
    >
      <div className="mx-auto hidden max-w-screen-2xl p-4 lg:block lg:px-8">
        <HeaderDesktop />
      </div>
      <div className="mx-auto max-w-screen-2xl p-4 lg:hidden lg:px-8">
        <HeaderMobile />
      </div>
    </div>
  );
}
