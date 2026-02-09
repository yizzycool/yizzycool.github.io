'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navigation from './components/navigation';
import ThemeSelector from '../theme-selector';
import SearchDialog from '@/components/common/search-dialog';

export default function HeaderDesktop() {
  return (
    <div className="flex items-center justify-between">
      <Link className="flex items-center" href="/">
        <Image
          src="/assets/images/header/logo.png"
          width="30"
          height="30"
          alt="Logo"
        />
        <div className="ml-4 text-xl font-bold">Yizzy Peasy</div>
      </Link>

      <div className="items-centexr flex flex-1 justify-end px-4">
        <SearchDialog deviceType="desktop" />
      </div>

      <Navigation />

      <div className="mx-2 h-4 w-px bg-neutral-300 dark:bg-neutral-700" />

      <div className="flex items-center pl-4">
        <ThemeSelector />
      </div>
    </div>
  );
}
