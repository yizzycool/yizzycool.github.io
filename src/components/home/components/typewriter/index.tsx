'use client';

import styles from './index.module.scss';
import { useEffect, useMemo, useState } from 'react';
import browserUtils from '@/utils/browser-utils';
import _fill from 'lodash/fill';
import _forEach from 'lodash/forEach';
import _random from 'lodash/random';
import _last from 'lodash/last';
import _size from 'lodash/size';

const Intros = ['Hi There', 'I am Yizzy', 'Front End Developer'];
const defaultShowedLength = _fill(Array(Intros.length), 0);

export default function Typewritter() {
  const [showedLine, setShowedLine] = useState(0);
  const [showedLength, setShowedLength] = useState(defaultShowedLength);

  const isLastWordOfEachLine = useMemo(() => {
    return showedLength[showedLine] === Intros[showedLine].length;
  }, [showedLine, showedLength]);

  const isLastWordOfLastLine = useMemo(() => {
    return (
      showedLine === _size(Intros) - 1 &&
      showedLength[showedLine] === Intros[showedLine].length
    );
  }, [showedLine, showedLength]);

  // Start typewritter effect
  useEffect(() => {
    startTransition();
  }, [showedLength]);

  const startTransition = async () => {
    const delay = getDelay();
    await browserUtils.sleep(delay);
    const nextShowedLength = [...showedLength];
    if (isLastWordOfLastLine) {
      setShowedLine(0);
      setShowedLength(defaultShowedLength);
    } else if (isLastWordOfEachLine) {
      const nextLine = (showedLine + 1) % _size(Intros);
      nextShowedLength[nextLine] = 0;
      setShowedLine(nextLine);
      setShowedLength(nextShowedLength);
    } else {
      nextShowedLength[showedLine] += 1;
      setShowedLength(nextShowedLength);
    }
  };

  const getDelay = () => {
    // Default: 50ms
    let delay = 50;
    if (isLastWordOfLastLine) {
      delay = 5000;
    } else if (isLastWordOfEachLine) {
      delay = 1000;
    }
    const randomDelay = _random(0, 25, false);
    return delay + randomDelay;
  };

  return (
    <div className={styles.container}>
      {Intros.map((intro, idx) => (
        <div key={idx} className={styles[`intro${idx + 1}`]}>
          {intro.substring(0, showedLength[idx])}
          {idx === showedLine && <span className={styles.cursor}>|</span>}
        </div>
      ))}
    </div>
  );
}
