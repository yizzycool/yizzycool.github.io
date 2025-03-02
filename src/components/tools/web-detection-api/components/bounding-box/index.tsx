'use client';

import { FaceDetectionResults } from '../../types/types';
import _isNull from 'lodash/isNull';
import _map from 'lodash/map';
import _round from 'lodash/round';

export default function BoundingBox({
  results,
}: {
  results: FaceDetectionResults | null;
}) {
  if (_isNull(results)) return null;

  return (
    <>
      {_map(results, ({ boundingBox }, idx) => (
        <div
          key={idx}
          className="absolute z-10 border-2 border-sky-600"
          style={{
            top: `${_round(boundingBox.top)}px`,
            left: `${_round(boundingBox.left)}px`,
            width: `${_round(boundingBox.width)}px`,
            height: `${_round(boundingBox.height)}px`,
          }}
        ></div>
      ))}
    </>
  );
}
