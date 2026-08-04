'use client';

import { useEffect } from 'react';

type OriginTrialMetaProps = {
  token: string;
};

export default function OriginTrialMeta({ token }: OriginTrialMetaProps) {
  useEffect(() => {
    const trialMeta = document.createElement('meta');
    trialMeta.httpEquiv = 'origin-trial';
    trialMeta.content = token;

    document.head.appendChild(trialMeta);

    return () => {
      if (document.head.contains(trialMeta)) {
        document.head.removeChild(trialMeta);
      }
    };
  }, [token]);

  return null;
}
