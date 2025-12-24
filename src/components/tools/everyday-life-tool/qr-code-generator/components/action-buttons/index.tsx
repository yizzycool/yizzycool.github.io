'use client';

import CopyAction from '@/components/common/action-button/copy';
import DownloadAction from '@/components/common/action-button/download';
import ShareAction from '@/components/common/action-button/share';

type Props = {
  qrCodeUrl: string;
};

export default function ActionButtons({ qrCodeUrl }: Props) {
  return (
    <div className="mx-auto w-full max-w-[280px] space-y-3">
      <div className="grid grid-cols-1">
        <DownloadAction
          size="lg"
          imageUrl={qrCodeUrl}
          filename={`qrcode-${Date.now()}`}
          label="Download PNG"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <CopyAction size="base" bordered content={qrCodeUrl} label="Link" />
        <ShareAction size="base" bordered content={qrCodeUrl} />
      </div>
    </div>
  );
}
