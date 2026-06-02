'use client';

import { useEffect, useState } from 'react';

import HeaderBlock from '../../header-block';
import SectionGap from '../../section-gap';
import CurrentTimeCard from './current-time-card';
import TimestampToDateCard from './timestamp-to-date-card';
import DateToTimestampCard from './date-to-timestamp-card';

export default function UnixTimestampConverter() {
  const [now, setNow] = useState<Date | null>(null);

  // Tick the clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <HeaderBlock />

      <SectionGap />

      <CurrentTimeCard now={now} />

      <SectionGap />

      <TimestampToDateCard />

      <SectionGap />

      <DateToTimestampCard />
    </>
  );
}
