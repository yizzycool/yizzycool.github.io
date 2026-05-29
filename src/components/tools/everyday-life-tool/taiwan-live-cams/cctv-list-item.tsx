import { useMemo } from 'react';
import type { TdxCamera } from '.';

import { cn } from '@/utils/cn';

type Props = {
  cam: TdxCamera;
  isSelected: boolean;
  onSelect: (cam: TdxCamera) => void;
  isTrending?: boolean;
};

export default function CctvListItem({
  cam,
  isSelected,
  onSelect,
  isTrending,
}: Props) {
  const handleClickButton = (cam: TdxCamera) => {
    onSelect({ ...cam, source: 'list-click' });
  };

  const name = useMemo(() => {
    if (!cam) {
      return '';
    }

    const { SurveillanceDescription, RoadName, RoadSection } = cam;
    const { Start, End } = RoadSection || {};

    if (SurveillanceDescription) {
      return SurveillanceDescription;
    } else if (RoadName) {
      if (Start && End) {
        if (RoadName === Start) {
          return RoadName;
        } else if (Start === End) {
          return `${RoadName} (${Start})`;
        } else {
          return `${RoadName} (${Start} - ${End})`;
        }
      }
      return RoadName;
    } else if (Start && End) {
      return `${Start} - ${End}`;
    }
    return '';
  }, [cam]);

  return (
    <button
      onClick={() => handleClickButton(cam)}
      className={cn(
        'group relative h-32 w-full overflow-hidden rounded-2xl border-2 transition-all',
        isSelected
          ? 'border-blue-500 shadow-lg shadow-blue-500/10'
          : 'border-transparent'
      )}
    >
      <img
        loading="lazy"
        src={`https://picsum.photos/seed/${cam.CCTVID}/400/225`}
        alt="mock background image"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="absolute bottom-3 left-4 right-4 text-left">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <p className="text-[9px] font-black uppercase tracking-widest text-white/60">
            {cam.groupName}
          </p>
        </div>
        <p className="line-clamp-1 text-xs font-bold leading-tight text-white">
          {name || '---'}
        </p>
      </div>

      <div className="absolute right-3 top-3 flex flex-col items-end gap-1">
        <div className="flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 shadow-lg shadow-red-600/20">
          <div className="h-1 w-1 animate-pulse rounded-full bg-white" />
          <span className="text-[8px] font-black uppercase italic text-white">
            Live
          </span>
        </div>
        {isTrending && (
          <div className="flex rounded-full bg-amber-500 px-2 py-0.5 shadow-lg shadow-amber-500/20">
            <span className="text-[8px] font-black uppercase italic tracking-tighter text-white">
              Hot
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
