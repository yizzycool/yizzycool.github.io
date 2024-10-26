'use client';

import styles from './index.module.scss';
import Image from 'next/image';
import { AppBar, Container } from '@mui/material';
import Settings from './components/settings';

export default function Header() {
  return (
    <AppBar position="fixed" className={styles.appBar}>
      <Container maxWidth="xl" className={styles.container}>
        <div className={styles.logoBlock}>
          <Image
            src="/assets/images/header/logo.png"
            width="40"
            height="40"
            alt="Logo"
          />
          <div className={styles.logoTitle}>Yizzy Peasy</div>
        </div>
        <div className={styles.rightBlock}>
          <Settings />
        </div>
      </Container>
    </AppBar>
  );
}
