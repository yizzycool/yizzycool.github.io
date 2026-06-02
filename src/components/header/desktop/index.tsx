'use client';

import Navigation from './navigation';
import ThemeSelector from '../theme-selector';
import SearchDialog from '@/components/common/dialog/search';

export default function HeaderDesktop() {
  return (
    <>
      <div className="flex flex-1 items-center justify-end px-4">
        <SearchDialog deviceType="desktop" />
      </div>

      <Navigation />

      <div className="mx-2 h-4 w-px bg-neutral-300 dark:bg-neutral-700" />

      <div className="flex items-center pl-4">
        <ThemeSelector />
      </div>
    </>
  );
}
