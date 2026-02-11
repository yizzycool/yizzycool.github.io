'use client';

import Label from '@/components/common/label';
import { LayoutTemplate } from 'lucide-react';
import Card from '@/components/common/card';
import Slider from '@/components/common/slider';
import { useState } from 'react';

type Props = {
  size: number;
  setSize: React.Dispatch<React.SetStateAction<number>>;
  margin: number;
  setMargin: React.Dispatch<React.SetStateAction<number>>;
};

export default function Layout({ size, setSize, margin, setMargin }: Props) {
  const [sizeStep, _setSizeStep] = useState(10);

  return (
    <div className="space-y-4 text-left">
      <Label icon={LayoutTemplate}>Layout</Label>
      <Card className="space-y-6">
        <div className="space-y-2">
          <Slider
            desc={`Size (${size}px)`}
            min={10}
            max={1000}
            value={size}
            step={sizeStep}
            showBubble={false}
            onChange={(e) => setSize(Number(e.target.value))}
            ariaLabel="Slider to adjust image size of QR code"
          />
        </div>
        <div className="space-y-2">
          <Slider
            desc={`Margin (${margin}px)`}
            min={0}
            max={50}
            value={margin}
            step={1}
            showBubble={false}
            onChange={(e) => setMargin(Number(e.target.value))}
            ariaLabel="Slider to adjust margin of QR code"
          />
        </div>
      </Card>
    </div>
  );
}
