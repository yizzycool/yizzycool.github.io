'use-client';

import { TranslatorApiSupportedStatus } from '../..';
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import _get from 'lodash/get';
import _isNull from 'lodash/isNull';

export default function ApiStatus({
  supportStatus,
  supportKey,
}: {
  supportStatus: TranslatorApiSupportedStatus;
  supportKey: string;
}) {
  const isSupported = _get(supportStatus, supportKey);

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
