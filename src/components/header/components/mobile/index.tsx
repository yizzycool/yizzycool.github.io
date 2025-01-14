'use client';

import styles from './index.module.scss';
import Link from 'next/link';
import Image from 'next/image';
import { Typography } from '@mui/material';
import Settings from '../settings';

export default function HeaderMobile() {
  return (
    <>
      <Link className={styles.logoBlock} href="/">
        <Image
          src="/assets/images/header/logo.png"
          width="40"
          height="40"
          alt="Logo"
        />
      </Link>
      <div className={styles.rightBlock}>
        <Settings />
      </div>
    </>
  );
}
