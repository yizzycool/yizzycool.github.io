'use-client';

import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
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
          <CheckIcon className="mr-1 inline h-3 w-3" />
          Yes
        </>
      ) : (
        <>
          <XMarkIcon className="mr-1 inline h-3 w-3" />
          No
        </>
      )}
    </>
  );
}
