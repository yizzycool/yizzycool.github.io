export type CanvasRatioType = {
  title: string;
  desc?: string;
  width?: number;
  height?: number;
  isCustom?: boolean;
};

export const PRESET_ASPECT_RATIOS: CanvasRatioType[] = [
  {
    title: '1:1',
    width: 1080,
    height: 1080,
  },
  {
    title: '620:877',
    width: 2480,
    height: 3508,
  },
  {
    title: '9:16',
    desc: 'IG Story / Reel',
    width: 1080,
    height: 1920,
  },
  {
    title: '16:9',
    desc: 'YouTube HD',
    width: 1280,
    height: 720,
  },
  {
    title: '4:5',
    desc: 'IG Post Portrait',
    width: 1080,
    height: 1350,
  },
  {
    title: 'OG 1.91:1',
    desc: 'Blog / Social Cover',
    width: 1200,
    height: 630,
  },
  {
    title: '2:3',
    width: 1080,
    height: 1620,
  },
  {
    title: '3:2',
    width: 1620,
    height: 1080,
  },
  {
    title: '3:4',
    width: 1080,
    height: 1440,
  },
  {
    title: '4:3',
    width: 1440,
    height: 1080,
  },
  {
    title: '5:4',
    width: 1350,
    height: 1080,
  },
  {
    title: 'Custom Size',
    desc: 'Enter specific dimensions',
    isCustom: true,
  },
];
