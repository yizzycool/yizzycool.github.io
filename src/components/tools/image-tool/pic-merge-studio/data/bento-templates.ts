import type { BentoTemplateId } from '../types/config';

export type BentoCellSpec = {
  /** Normalized x in [0, 1] */
  x: number;
  /** Normalized y in [0, 1] */
  y: number;
  /** Normalized width in (0, 1] */
  w: number;
  /** Normalized height in (0, 1] */
  h: number;
  /** Optional bottom frame inset factor (used by Polaroid Strip) */
  polaroidBottom?: number;
};

export type BentoTemplateSpec = {
  id: Exclude<BentoTemplateId, 'uniform'>;
  label: string;
  shortLabel: string;
  cells: BentoCellSpec[];
};

export const BENTO_TEMPLATES: BentoTemplateSpec[] = [
  {
    id: 'bento-1-2',
    label: 'Editorial 1 + 2',
    shortLabel: '1+2',
    cells: [
      { x: 0, y: 0, w: 0.56, h: 1 },
      { x: 0.56, y: 0, w: 0.44, h: 0.5 },
      { x: 0.56, y: 0.5, w: 0.44, h: 0.5 },
    ],
  },
  {
    id: 'bento-2-1',
    label: 'Bento 2 : 1 Split',
    shortLabel: '2:1',
    cells: [
      { x: 0, y: 0, w: 0.67, h: 1 },
      { x: 0.67, y: 0, w: 0.33, h: 1 },
    ],
  },
  {
    id: 'focus-1-3',
    label: 'Hero Focus 1 + 3',
    shortLabel: '1+3',
    cells: [
      { x: 0, y: 0, w: 1, h: 0.62 },
      { x: 0, y: 0.62, w: 1 / 3, h: 0.38 },
      { x: 1 / 3, y: 0.62, w: 1 / 3, h: 0.38 },
      { x: 2 / 3, y: 0.62, w: 1 / 3, h: 0.38 },
    ],
  },
  {
    id: 'hero-top-2',
    label: 'Showcase 1 + 2 Bottom',
    shortLabel: 'Top+2',
    cells: [
      { x: 0, y: 0, w: 1, h: 0.54 },
      { x: 0, y: 0.54, w: 0.5, h: 0.46 },
      { x: 0.5, y: 0.54, w: 0.5, h: 0.46 },
    ],
  },
  {
    id: 'polaroid-strip',
    label: 'Polaroid Strip',
    shortLabel: 'Polaroid',
    cells: [
      { x: 0.04, y: 0.04, w: 0.92, h: 0.28, polaroidBottom: 0.16 },
      { x: 0.04, y: 0.36, w: 0.92, h: 0.28, polaroidBottom: 0.16 },
      { x: 0.04, y: 0.68, w: 0.92, h: 0.28, polaroidBottom: 0.16 },
    ],
  },
];

export function getBentoTemplateById(
  id: BentoTemplateId | undefined
): BentoTemplateSpec | undefined {
  if (!id || id === 'uniform') return undefined;
  return BENTO_TEMPLATES.find((t) => t.id === id);
}
