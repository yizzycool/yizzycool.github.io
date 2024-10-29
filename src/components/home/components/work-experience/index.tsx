'use client';

import styles from './index.module.scss';
import useIntersectionObserver from '@/hooks/window/use-intersection-observer';
import { Container, Divider, Link, Paper } from '@mui/material';
import { OpenInNew, WorkHistory } from '@mui/icons-material';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from '@mui/lab';
import ExperienceData from './data/experiences.json';
import _get from 'lodash/get';

const THRESHOLD = 0.3;

export default function WorkExperience() {
  const { hit } = useIntersectionObserver({
    targetSelector: '#work-experience',
    threshold: THRESHOLD,
  });

  return (
    <Container id="work-experience" maxWidth="xl" className={styles.container}>
      <div className={hit ? styles.containerFadeIn : styles.containerFadeOut}>
        <Divider textAlign="center" className={styles.title}>
          Work Experience
        </Divider>
        <Timeline className={styles.timeline}>
          {ExperienceData.map((data, idx) => (
            <TimelineItem key={idx}>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent className={styles.timelineContent}>
                <div className={styles.flexSpaceBetween}>
                  <div className={styles.positionTitle}>{data.jobTitle}</div>
                  <div className={styles.duration}>{data.duration}</div>
                </div>
                <Link
                  href={data.corpLink}
                  underline="hover"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.corpName}
                >
                  {data.corpName}
                  <OpenInNew className={styles.externalIcon} />
                </Link>
                {data.descriptions.map((desc, descIdx) => (
                  <Paper key={descIdx} elevation={8} className={styles.paper}>
                    <div className={styles.descBlock}>{desc.title}</div>
                    <div className={styles.descItemsContainer}>
                      {desc.items.map((item, itemIdx) => (
                        <div key={itemIdx} className={styles.itemBlock}>
                          <WorkHistory className={styles.workHistoryIcon} />
                          <div dangerouslySetInnerHTML={{ __html: item }} />
                        </div>
                      ))}
                    </div>
                  </Paper>
                ))}
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </div>
    </Container>
  );
}
