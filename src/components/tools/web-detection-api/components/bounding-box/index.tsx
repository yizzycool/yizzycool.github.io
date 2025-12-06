'use client';

import { TransformedResults } from '../../types';
import _isNull from 'lodash/isNull';
import _map from 'lodash/map';
import _round from 'lodash/round';

type Props = {
  results: TransformedResults;
};

export default function BoundingBox({ results }: Props) {
  if (_isNull(results)) return null;

  return (
    <>
      {_map(results, ({ label, text, confidence, boundingBox }, idx) => (
        <div
          key={idx}
          className="group absolute z-10 border-2 border-blue-500 bg-blue-500/20 transition-colors hover:bg-blue-500/30"
          style={{
            top: `${_round(boundingBox.top)}px`,
            left: `${_round(boundingBox.left)}px`,
            width: `${_round(boundingBox.width)}px`,
            height: `${_round(boundingBox.height)}px`,
          }}
        >
          <div className="absolute -top-7 left-0 z-10 whitespace-nowrap rounded bg-blue-500 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
            {text || label}{' '}
            {confidence && ` (${Math.round(confidence * 100)}%)`}
          </div>
        </div>
      ))}
    </>
  );
}
