import styles from './index.module.scss';
import { Container, Divider, Link } from '@mui/material';

export default function Footer() {
  return (
    <Container maxWidth="xl">
      <Divider />
      <footer className={styles.footer}>
        <p>
          Designed & Developed by{' '}
          <Link
            href="https://www.linkedin.com/in/yizzy/"
            underline="hover"
            target="_blank"
            rel="noreferrer"
            color="info"
          >
            Yizzy Wu
          </Link>{' '}
          &copy; 2024
        </p>
      </footer>
    </Container>
  );
}
