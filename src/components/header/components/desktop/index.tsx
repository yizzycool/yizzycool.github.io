'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navigation from './components/navigation';
import ThemeSelector from '../theme-selector';

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
      <div className="flex flex-1 items-center justify-end px-4">
        <Navigation />
      </div>
      <div className="flex items-center">
        <ThemeSelector />
      </div>
    </div>
  );
}
