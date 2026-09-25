import type { LucideIcon } from 'lucide-react';

import { CaseUpper, QrCode, ScanFace } from 'lucide-react';

export type DetectionTab = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const DETECTION_TABS: readonly DetectionTab[] = [
  {
    label: 'Barcode Detector',
    href: '/tools/web-detection-api/barcode-detector',
    icon: QrCode,
  },
  {
    label: 'Face Detector',
    href: '/tools/web-detection-api/face-detector',
    icon: ScanFace,
  },
  {
    label: 'Text Detector',
    href: '/tools/web-detection-api/text-detector',
    icon: CaseUpper,
  },
] as const;
