'use client';

import HeaderDesktop from './components/desktop';
import HeaderMobile from './components/mobile';

export default function Header() {
  return (
    <div className="supports-backdrop-blur:bg-white/60 fixed top-0 z-50 w-full bg-white/95 backdrop-blur lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] dark:bg-neutral-900/60">
      <div className="mx-auto hidden max-w-screen-2xl p-4 lg:block lg:px-8">
        <HeaderDesktop />
      </div>
      <div className="mx-auto max-w-screen-2xl p-4 lg:hidden lg:px-8">
        <HeaderMobile />
      </div>
    </div>
  );
}
