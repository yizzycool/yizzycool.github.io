import { useEffect, useMemo, useState } from 'react';

type Props = {
  text: string;
  size: number;
  color: string;
  bgColor: string;
  margin: number;
};

export default function useGenerateQrCode({
  text,
  size,
  color,
  bgColor,
  margin,
}: Props) {
  const [isSystemReady, setIsSystemReady] = useState<boolean | null>(null);

  const qrCodeUrl = useMemo(() => {
    const encodedText = encodeURIComponent(text);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}&color=${color.replace('#', '')}&bgcolor=${bgColor.replace('#', '')}&margin=${margin}`;
  }, [text, size, color, bgColor, margin]);

  useEffect(() => {
    fetch('https://api.qrserver.com/v1/create-qr-code/?size=10x10&data=1')
      .then((response) => setIsSystemReady(response.status === 200))
      .catch(() => setIsSystemReady(false));
  }, []);

  return {
    isSystemReady,
    qrCodeUrl,
  };
}
