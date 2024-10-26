import styles from './index.module.scss';
import Image from 'next/image';
import Typewritter from './components/typewriter';
import { Container, Grid2 } from '@mui/material';

export default function Home() {
  return (
    <div className={styles.background}>
      <div className={styles.backgroundMask} />
      <Container maxWidth="xl" className={styles.container}>
        <Grid2 container spacing={2} className={styles.flex}>
          <Grid2 size={6} className={styles.flexItem}>
            <Typewritter />
          </Grid2>
          <Grid2 size={6} className={styles.flexItem}>
            <Image
              className={styles.mainImage}
              width={1024}
              height={1024}
              src="/assets/images/home/avatar.png"
              objectFit="contain"
              objectPosition="center"
              alt="main image"
            />
          </Grid2>
        </Grid2>
      </Container>
    </div>
  );
}
