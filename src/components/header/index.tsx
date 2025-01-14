'use client';

import styles from './index.module.scss';
import { AppBar, Container } from '@mui/material';
import useWindowDevice from '@/hooks/window/use-window-device';
import HeaderDesktop from './components/desktop';
import HeaderMobile from './components/mobile';

export default function Header() {
  const { isPad } = useWindowDevice();

  return (
    <AppBar position="fixed" color="header" className={styles.appBar}>
      <Container maxWidth="xl" className={styles.container}>
        {isPad ? <HeaderDesktop /> : <HeaderMobile />}
      </Container>
    </AppBar>
  );
}
