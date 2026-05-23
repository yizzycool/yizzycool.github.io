import type { TdxCamera } from '..';

import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { memo } from 'react';

type Props = {
  cam: TdxCamera;
  onSelectCamera: (cam: TdxCamera | null) => void;
  cctvIcon: L.Icon;
};

export default memo(
  function CctvMarker({ cam, onSelectCamera, cctvIcon }: Props) {
    const handleClickMark = (cam: TdxCamera) => {
      onSelectCamera({ ...cam, source: 'map-marker' });
    };

    return (
      <Marker
        key={`${cam.CCTVID} ${cam.LinkID}`}
        position={[cam.PositionLat, cam.PositionLon]}
        eventHandlers={{
          click: () => handleClickMark(cam),
        }}
        icon={cctvIcon}
      />
    );
  },
  (prevProps, nextProps) => {
    return prevProps.cam.CCTVID === nextProps.cam.CCTVID;
  }
);
