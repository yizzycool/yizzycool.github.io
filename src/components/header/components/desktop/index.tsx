'use client';

import styles from './index.module.scss';
import Link from 'next/link';
import Image from 'next/image';
import { Typography } from '@mui/material';
import Settings from '../settings';

export default function HeaderDesktop() {
  return (
    <>
      <Link className={styles.logoBlock} href="/">
        <Image
          src="/assets/images/header/logo.png"
          width="40"
          height="40"
          alt="Logo"
        />
        <Typography
          color="textPrimary"
          component="div"
          className={styles.logoText}
        >
          Yizzy Peasy
        </Typography>
      </Link>
      <div className={styles.rightBlock}>
        <Settings />
      </div>
    </>
  );
}
