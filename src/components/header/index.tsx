'use client';

import styles from './index.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import { AppBar, Container, Typography } from '@mui/material';
import Settings from './components/settings';

export default function Header() {
  return (
    <AppBar position="fixed" color="header" className={styles.appBar}>
      <Container maxWidth="xl" className={styles.container}>
        <Link className={styles.logoBlock} href="/">
          <Image
            src="/assets/images/header/logo.png"
            width="40"
            height="40"
            alt="Logo"
            className={styles.logo}
          />
          <Typography
            color="textPrimary"
            component="div"
            px={{
              fontSize: '1.5rem',
              fontWeight: '600',
              whiteSpace: 'nowrap',
            }}
          >
            Yizzy Peasy
          </Typography>
        </Link>
        <div className={styles.rightBlock}>
          <Settings />
        </div>
      </Container>
    </AppBar>
  );
}
