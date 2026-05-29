'use client';

import type { TdxCctvInfo } from '@/data/tools/everyday-life-tool/taiwan-live-cams/cctv';

import { useState, useMemo } from 'react';
import { flatMap, map } from 'lodash';
import dynamic from 'next/dynamic';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import useGeolocation from '@/hooks/window/use-geolocation';
import { useGetCctv } from './hooks/use-get-cctv';
import { cn } from '@/utils/cn';
import { AlertTriangle } from 'lucide-react';
import HeaderBlock from '../../header-block';
import SectionGap from '../../section-gap';
import CctvListPanel from './cctv-list-panel';
import {
  TdxCctvKey,
  tdxCctvKeyEnToZhTw,
} from '@/data/tools/everyday-life-tool/taiwan-live-cams/cctv';

const LiveCamMap = dynamic(() => import('./live-cam-map'), {
  ssr: false,
  loading: () => (
    <div
      className={cn(
        'flex h-[400px] items-center justify-center rounded-3xl border border-neutral-200 bg-white shadow-sm',
        'lg:col-span-8 lg:row-span-6 lg:h-full',
        'dark:border-neutral-800 dark:bg-neutral-900'
      )}
    >
      <p className="animate-pulse text-zinc-500">地圖模組載入中...</p>
    </div>
  ),
});

const VideoPreview = dynamic(() => import('./video-preview'), {
  ssr: false,
});

export interface TdxCamera extends TdxCctvInfo {
  groupKey: TdxCctvKey;
  groupName: string;
  source?: 'list-click' | 'search-bar' | 'map-marker';
}

export default function TaiwanLiveCams() {
  const [selectedCamera, setSelectedCamera] = useState<TdxCamera | null>(null);

  const { getFadeUpClass } = useGetTransitionClass();

  const { userLocation, handleGetLocation, error: _e } = useGeolocation();

  const { data } = useGetCctv();

  const cameras: TdxCamera[] = useMemo(() => {
    if (!data) return [];

    return flatMap(data, (cctvValue, cctvKey) => {
      return map(cctvValue.CCTVs, (cctvInfo) => {
        return {
          groupKey: cctvKey as TdxCctvKey,
          groupName: tdxCctvKeyEnToZhTw[cctvKey as TdxCctvKey],
          ...cctvInfo,
        };
      });
    });
  }, [data]);

  const handleSelectCamera = (cam: TdxCamera | null) => {
    setSelectedCamera(cam);
    if (!cam) return;
  };

  return (
    <div lang="zh-TW" className={cn('h-full w-full', getFadeUpClass())}>
      <HeaderBlock />

      <SectionGap />

      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-800/50">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <p className="text-left font-medium tracking-wide">
          目前系統僅完成<strong className="mx-1 font-bold">新北市</strong>
          的即時影像串接，其餘縣市的影像正在趕工中，敬請期待！
        </p>
      </div>

      <main className="grid grid-cols-1 gap-4 overflow-y-auto lg:h-[calc(100dvh_-_300px)] lg:grid-cols-12 lg:grid-rows-6 lg:overflow-hidden">
        {/* Map View (Main Container) - Bento Cell 1 */}
        <LiveCamMap
          cameras={cameras}
          selectedCamera={selectedCamera}
          onSelectCamera={handleSelectCamera}
          onGetGeolocation={handleGetLocation}
          userLocation={userLocation}
        />

        {/* Improved List Grid with Tabs - Bento Cell 2 */}
        <CctvListPanel
          userLocation={userLocation}
          cameras={cameras}
          selectedCamera={selectedCamera}
          onSelectCamera={handleSelectCamera}
          onGetGeolocation={handleGetLocation}
        />

        {/* Global Video Preview Overlay */}
        <VideoPreview
          selectedCamera={selectedCamera}
          onSelectCamera={handleSelectCamera}
        />
      </main>

      <p className="mt-4 text-center text-[9px] font-black uppercase tracking-[0.2em] lg:text-left">
        資料來源：交通部運輸資料流通服務平臺。影像內容均為即時連線。
      </p>
    </div>
  );
}
