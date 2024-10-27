import styles from './index.module.scss';
import Image from 'next/image';
import Typewritter from '../typewriter';
import { Container, Grid2 } from '@mui/material';

export default function Intro() {
  return (
    <div className={styles.background}>
      <div className={styles.backgroundMask} />
      <Container maxWidth="xl" className={styles.container}>
        <Grid2
          container
          spacing={2}
          direction={{ xs: 'column-reverse', md: 'row' }}
          className={styles.flex}
        >
          <Grid2 size={{ xs: 12, md: 6 }} className={styles.flexItem}>
            <Typewritter />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }} className={styles.flexItem}>
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
