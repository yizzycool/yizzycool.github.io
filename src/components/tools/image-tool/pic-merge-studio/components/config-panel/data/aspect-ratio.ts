export type ConfitRatioType = {
  title: string;
  desc?: string;
  width?: number;
  height?: number;
  isCustom?: boolean;
};

export const PresetAspectRatios: ConfitRatioType[] = [
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
    width: 1080,
    height: 1920,
  },
  {
    title: '16:9',
    width: 1920,
    height: 1080,
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
    title: '4:5',
    width: 1080,
    height: 1350,
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
