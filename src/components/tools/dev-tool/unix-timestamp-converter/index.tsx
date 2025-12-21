'use client';

import { useEffect, useState } from 'react';
import HeaderBlock from '../../components/header-block';
import SectionGap from '../../components/section-gap';
import CurrentTimeCard from './components/current-time-card';
import TimestampToDateCard from './components/timestamp-to-date-card';
import DateToTimestampCard from './components/date-to-timestamp-card';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import _size from 'lodash/size';

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
