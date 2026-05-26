import type { TdxCamera } from '..';

import { cn } from '@/utils/cn';
import { filter, isEmpty } from 'lodash';
import { Search, MapPin, Navigation, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import CctvListItem from './cctv-list-item';

type Props = {
  userLocation: [number, number] | null;
  cameras: TdxCamera[];
  selectedCamera: TdxCamera | null;
  onSelectCamera: (cam: TdxCamera | null) => void;
  onGetGeolocation: () => void;
};

const TRENDING_CCTV_IDS = [
  'C000092', // 新北環快，南下斜張橋北側(三重機車道上來往板橋方向)
  'C000176', // 淡水區中正路、中山路口
  'C000178', // 淡水區中山路、文化路口
  'C000232', // 瑞芳區瑞金公路、基山街
  'C000014', // 板橋區縣民大道、板橋火車站前(新府路新站路間)
  'C000289', // 三峽區文化路、中山路
];

export default function CctvListPanel({
  userLocation,
  cameras,
  selectedCamera,
  onSelectCamera,
  onGetGeolocation,
}: Props) {
  const [activeTab, setActiveTab] = useState<'nearby' | 'trending' | 'search'>(
    'trending'
  );
  const [isComposing, setIsComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Filters the full camera list to only include those defined in TRENDING_CCTV_IDS.
   */
  const trendingCameras: TdxCamera[] = useMemo(() => {
    if (isEmpty(cameras)) return [];

    return filter(cameras, (cam) => {
      return TRENDING_CCTV_IDS.includes(cam.CCTVID);
    }).sort((a, b) => {
      return (
        TRENDING_CCTV_IDS.indexOf(a.CCTVID) -
        TRENDING_CCTV_IDS.indexOf(b.CCTVID)
      );
    });
  }, [cameras]);

  /**
   * Calculates the 5 nearest cameras based on the user's current geolocation
   * using the Pythagorean theorem for distance approximation.
   */
  const nearbyCameras = useMemo(() => {
    if (!userLocation || isEmpty(cameras)) return [];

    return cameras
      .map((cam) => ({
        ...cam,
        distance: Math.sqrt(
          Math.pow(cam.PositionLat - userLocation[0], 2) +
            Math.pow(cam.PositionLon - userLocation[1], 2)
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
  }, [cameras, userLocation]);

  /**
   * Initializes Fuse.js for fuzzy searching through the camera list.
   * Configures keys for RoadName, groupName, and CCTVID with a 0.3 threshold.
   */
  const fuse = useMemo(() => {
    return new Fuse(cameras, {
      keys: [
        'CCTVID',
        'SurveillanceDescription',
        'RoadName',
        'RoadSection.Start',
        'RoadSection.End',
        'groupName',
      ],
      threshold: 0.3,
    });
  }, [cameras]);

  /**
   * Filters the camera list based on the search query using Fuse.js.
   * Prevents searching during IME composition to avoid partial results.
   */
  const searchResults = useMemo(() => {
    if (isComposing || !searchQuery) return [];
    return fuse
      .search(searchQuery)
      .slice(0, 10)
      .map((result) => result.item);
  }, [searchQuery, fuse, isComposing]);

  return (
    <div
      className={cn(
        'flex h-[calc(100dvh_-_80px)] flex-col rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm',
        'lg:col-span-4 lg:row-span-6 lg:h-full',
        'dark:border-neutral-800 dark:bg-neutral-900'
      )}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="flex items-center gap-2 font-bold text-neutral-800 dark:text-neutral-100">
          <span className="h-4 w-1.5 rounded-full bg-blue-600" />
          影像瀏覽
        </h2>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-2xl border border-neutral-200/50 bg-neutral-100 p-1.5 dark:border-neutral-700/50 dark:bg-neutral-800">
        <button
          onClick={() => setActiveTab('trending')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[10px] font-black uppercase tracking-widest transition-all',
            activeTab === 'trending'
              ? 'bg-white text-blue-600 shadow-sm dark:bg-neutral-700 dark:text-blue-400'
              : 'text-neutral-400'
          )}
        >
          <TrendingUp className="h-3 w-3" />
          熱門
        </button>
        <button
          onClick={() => setActiveTab('nearby')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[10px] font-black uppercase tracking-widest transition-all',
            activeTab === 'nearby'
              ? 'bg-white text-blue-600 shadow-sm dark:bg-neutral-700 dark:text-blue-400'
              : 'text-neutral-400'
          )}
        >
          <Navigation className="h-3 w-3" />
          附近
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[10px] font-black uppercase tracking-widest transition-all',
            activeTab === 'search'
              ? 'bg-white text-blue-600 shadow-sm dark:bg-neutral-700 dark:text-blue-400'
              : 'text-neutral-400'
          )}
        >
          <Search className="h-3 w-3" />
          搜尋
        </button>
      </div>

      <div className="scrollbar-hide flex-1 space-y-3 overflow-y-auto pr-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {activeTab === 'nearby' &&
              (userLocation ? (
                nearbyCameras.length > 0 ? (
                  nearbyCameras.map((cam, idx) => (
                    <CctvListItem
                      key={idx}
                      cam={cam}
                      isSelected={
                        selectedCamera?.CCTVID === cam.CCTVID &&
                        selectedCamera?.LinkID === cam.LinkID
                      }
                      onSelect={onSelectCamera}
                    />
                  ))
                ) : (
                  <div className="space-y-2 py-12 text-center text-neutral-400 opacity-50">
                    <MapPin className="mx-auto h-6 w-6" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">
                      此區域尚無影像
                    </p>
                  </div>
                )
              ) : (
                <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-12 text-center dark:border-neutral-800 dark:bg-neutral-800/30">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                    <Navigation className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="mb-2 text-sm font-bold text-neutral-800 dark:text-neutral-200">
                    點擊取得目前位置
                  </p>
                  <p className="mb-6 text-[10px] leading-relaxed text-neutral-400">
                    我們需要您的位置訊息來顯示鄰近的監視器影像。
                  </p>
                  <button
                    onClick={onGetGeolocation}
                    className="w-full rounded-xl bg-blue-600 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                  >
                    立即開啟定位
                  </button>
                </div>
              ))}

            {activeTab === 'trending' &&
              trendingCameras.map((cam, idx) => (
                <CctvListItem
                  key={idx}
                  cam={cam}
                  isSelected={
                    selectedCamera?.CCTVID === cam.CCTVID &&
                    selectedCamera?.LinkID === cam.LinkID
                  }
                  onSelect={onSelectCamera}
                  isTrending={true}
                />
              ))}

            {activeTab === 'search' && (
              <div className="space-y-3">
                <div className="sticky top-0 z-10 bg-white pb-2 dark:bg-neutral-900">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onCompositionStart={() => setIsComposing(true)}
                      onCompositionEnd={() => setIsComposing(false)}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜尋路名、區域或 ID..."
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-9 pr-4 text-sm outline-none transition-colors focus:border-blue-500 focus:bg-white dark:border-neutral-800 dark:bg-neutral-900/50 dark:focus:border-blue-500 dark:focus:bg-neutral-900"
                    />
                  </div>
                </div>

                {searchQuery ? (
                  searchResults.length > 0 ? (
                    searchResults.map((cam, idx) => (
                      <CctvListItem
                        key={idx}
                        cam={cam}
                        isSelected={
                          selectedCamera?.CCTVID === cam.CCTVID &&
                          selectedCamera?.LinkID === cam.LinkID
                        }
                        onSelect={onSelectCamera}
                      />
                    ))
                  ) : (
                    <div className="space-y-3 py-16 text-center text-neutral-400 opacity-40">
                      <Search className="mx-auto h-8 w-8" strokeWidth={1} />
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
                        找不到相符的影像
                      </p>
                    </div>
                  )
                ) : (
                  <div className="space-y-3 py-16 text-center text-neutral-400 opacity-40">
                    <Search className="mx-auto h-8 w-8" strokeWidth={1} />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
                      輸入關鍵字開始搜尋
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
