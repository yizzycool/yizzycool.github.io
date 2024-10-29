'use client';

import styles from './index.module.scss';
import useIntersectionObserver from '@/hooks/window/use-intersection-observer';
import { Container, Divider } from '@mui/material';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from '@mui/lab';
import EducationData from './data/educations.json';
import _get from 'lodash/get';

const THRESHOLD = 0.3;

export default function Education() {
  const { hit } = useIntersectionObserver({
    targetSelector: '#education',
    threshold: THRESHOLD,
  });

  return (
    <Container id="education" maxWidth="xl" className={styles.container}>
      <div className={hit ? styles.containerFadeIn : styles.containerFadeOut}>
        <Divider textAlign="center" className={styles.title}>
          Education
        </Divider>
        <Timeline className={styles.timeline}>
          {EducationData.map((data, idx) => (
            <TimelineItem key={idx}>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent className={styles.timelineContent}>
                <div className={styles.flexSpaceBetween}>
                  <div className={styles.name}>{data.name}</div>
                  <div className={styles.duration}>{data.duration}</div>
                </div>
                <div className={styles.department}>{data.department}</div>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </div>
    </Container>
  );
}
