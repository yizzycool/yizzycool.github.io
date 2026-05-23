'use client';

import type { TdxCamera } from '..';

import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

import { useEffect, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Navigation, Video } from 'lucide-react';
import { motion, animate, useMotionValue, useTransform } from 'motion/react';

import { cn } from '@/utils/cn';
import CctvMarker from './cctv-marker';

const cctvIcon = new L.Icon({
  iconUrl:
    '/assets/images/tools/everyday-life-tool/taiwan-live-cams/cctv-camera.png',
  iconSize: [25, 25],
  iconAnchor: [12, 12],
});

// Fix for default marker icons in Leaflet with Next.js
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

type Props = {
  cameras: TdxCamera[];
  selectedCamera: TdxCamera | null;
  onSelectCamera: (camera: TdxCamera | null) => void;
  zoom?: number;
  onGetGeolocation: () => void;
  userLocation: [number, number] | null;
};

export default function LiveCamMap({
  cameras,
  selectedCamera,
  onSelectCamera,
  onGetGeolocation,
  userLocation,
}: Props) {
  const [isMapReady, setIsMapReady] = useState(false);

  const cameraCounter = useMotionValue(0);
  const roundedCameraCount = useTransform(() =>
    Math.round(cameraCounter.get())
  );

  useEffect(() => {
    const controls = animate(cameraCounter, cameras.length, { duration: 1 });
    return () => controls.stop();
  }, [cameras]);

  return (
    <div
      className={cn(
        'relative h-[400px] overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm',
        'lg:col-span-8 lg:row-span-6 lg:h-auto',
        'dark:border-neutral-800 dark:bg-neutral-900'
      )}
    >
      {/* Shrunken Stats Overlay */}
      <div className="pointer-events-none absolute right-4 top-4 z-10 flex flex-col gap-2">
        <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/10 bg-blue-600 px-4 py-2 shadow-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <Video className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest text-blue-100">
              在線影像
            </p>
            <motion.p className="text-sm font-black text-white">
              {roundedCameraCount}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Leaflet Map */}
      <div
        className={cn(
          'relative h-full w-full overflow-hidden rounded-xl text-neutral-600 shadow-sm',
          'border border-neutral-200 dark:border-neutral-800',
          'bg-neutral-100 dark:bg-neutral-800'
        )}
      >
        <MapContainer
          // center={[23.6978, 120.9605]}
          // zoom={7}
          center={[25.017322, 121.5407]}
          zoom={11}
          scrollWheelZoom={true}
          whenReady={() => setIsMapReady(true)}
          preferCanvas={true}
          className="z-0 h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeViewToUserLocation userLocation={userLocation} />
          <MapController selectedCamera={selectedCamera} />

          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={60}
            spiderfyOnMaxZoom={true}
            polygonOptions={{
              fillColor: '#ffffff',
              color: '#1e40af',
              weight: 2,
              opacity: 0.1,
              fillOpacity: 0.3,
            }}
            showCoverageOnHover={true}
          >
            {isMapReady &&
              cameras.map((cam, idx) => (
                <CctvMarker
                  key={idx}
                  cam={cam}
                  onSelectCamera={onSelectCamera}
                  cctvIcon={cctvIcon}
                />
              ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={onGetGeolocation}
          className="rounded-xl border border-neutral-200 bg-white p-3 text-neutral-600 shadow-md transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
        >
          <Navigation className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function MapController({
  selectedCamera,
}: {
  selectedCamera: TdxCamera | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedCamera || selectedCamera?.source !== 'list-click') return;

    map.setView([selectedCamera.PositionLat, selectedCamera.PositionLon], 15);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCamera]);

  return null;
}

function ChangeViewToUserLocation({
  userLocation,
}: {
  userLocation: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!userLocation) return;

    map.setView(userLocation, 15);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  return null;
}
