'use-client';

import { Check, X } from 'lucide-react';
import _isNull from 'lodash/isNull';

export default function ApiStatus({
  isSupported,
}: {
  isSupported: boolean | null;
}) {
  return (
    <>
      {_isNull(isSupported) ? (
        'Detecting...'
      ) : isSupported ? (
        <>
          <Check className="mr-1 inline h-3 w-3" />
          Yes
        </>
      ) : (
        <>
          <X className="mr-1 inline h-3 w-3" />
          No
        </>
      )}
    </>
  );
}
