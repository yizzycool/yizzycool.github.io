'use client';

import useFaceDetector from '../hooks/use-face-detector';
import Title from '../../components/title';
import OtherFeatures from '../components/other-features';
import SupportTable from '../components/support-table';
import _isNull from 'lodash/isNull';

export default function FaceDetectorApi() {
  const { isSupported, isPartialUnsupported } = useFaceDetector();

  return (
    <div className="mx-auto max-w-screen-2xl pt-[68px] text-center">
      <Title>Face Detector</Title>
      <SupportTable />
      <div className="p-10 py-40 font-bold">Under Development...</div>
      {_isNull(isSupported) ? null : !isSupported ? (
        <OtherFeatures type="unsupported" />
      ) : _isNull(isPartialUnsupported) ? null : isPartialUnsupported ? (
        <OtherFeatures type="partialUnsupported" />
      ) : (
        <div>
          <OtherFeatures type="discoverMore" />
        </div>
      )}
    </div>
  );
}
