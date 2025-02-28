'use client';

import useFaceDetector from '../hooks/use-face-detector';
import Title from '../../components/title';
import Unsupported from '../../components/unsupported';
import _isNull from 'lodash/isNull';

export default function FaceDetectorApi() {
  const { isSupported, isPartialUnsupported } = useFaceDetector();

  const isLoading =
    _isNull(isSupported) || (isSupported && _isNull(isPartialUnsupported));

  return (
    <div className="mx-auto max-w-screen-2xl pt-[68px] text-center">
      <Title>Face Detector</Title>
      {/* <SupportTable /> */}
      {isLoading ? null : !isSupported ? (
        <Unsupported type="unsupported" />
      ) : isPartialUnsupported ? (
        <Unsupported type="partialUnsupported" />
      ) : null}
    </div>
  );
}
