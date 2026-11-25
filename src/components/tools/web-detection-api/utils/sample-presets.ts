import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

export type SamplePresetOption = {
  id: string;
  label: string;
};

export type DetectorSamplePreset<T> = SamplePresetOption & {
  buildFile: () => Promise<File>;
  demoResults: T;
};

function makeBox(
  x: number,
  y: number,
  width: number,
  height: number
): DetectedBoundingBox {
  return {
    x,
    y,
    left: x,
    top: y,
    width,
    height,
    right: x + width,
    bottom: y + height,
  };
}

function canvasToPngFile(
  canvas: HTMLCanvasElement,
  filename: string
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create sample image'));
        return;
      }
      resolve(new File([blob], filename, { type: 'image/png' }));
    }, 'image/png');
  });
}

async function renderQrCanvasElement(
  value: string,
  size: number,
  fgColor = '#0f172a',
  bgColor = '#ffffff'
): Promise<HTMLCanvasElement> {
  const { QRCodeCanvas } = await import('qrcode.react');
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(
    createElement(QRCodeCanvas, {
      value,
      size,
      level: 'M',
      marginSize: 2,
      fgColor,
      bgColor,
    })
  );

  await new Promise((resolve) => requestAnimationFrame(resolve));
  const sourceCanvas = container.querySelector('canvas');
  const copy = document.createElement('canvas');
  copy.width = size;
  copy.height = size;
  if (sourceCanvas) {
    const ctx = copy.getContext('2d');
    ctx?.drawImage(sourceCanvas, 0, 0, size, size);
  }

  root.unmount();
  container.remove();
  return copy;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/**
 * Interactive preset posters containing real scannable QR codes for Barcode Detector.
 */
export function createBarcodeSamples(): Array<
  DetectorSamplePreset<BarcodeDetectionResults>
> {
  const wifiPayload = 'WIFI:T:WPA;S:YizzyCafe_5G;P:espresso2026;;';
  const urlPayload = 'https://yizzycool.github.io/tools';

  return [
    {
      id: 'wifi-poster',
      label: 'Cafe Wi-Fi Poster',
      demoResults: [
        {
          format: 'qr_code',
          rawValue: wifiPayload,
          boundingBox: makeBox(190, 140, 260, 260),
          cornerPoints: [
            { x: 190, y: 140 },
            { x: 450, y: 140 },
            { x: 450, y: 400 },
            { x: 190, y: 400 },
          ],
        },
      ],
      buildFile: async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 520;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas unavailable');

        const grad = ctx.createLinearGradient(0, 0, 640, 520);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, '#1e293b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 640, 520);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 14px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GUEST WIRELESS ACCESS', 320, 58);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 28px system-ui, sans-serif';
        ctx.fillText('Scan to Join YizzyCafe_5G', 320, 98);

        drawRoundedRect(ctx, 174, 124, 292, 292, 24);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        const qr = await renderQrCanvasElement(wifiPayload, 260, '#0f172a');
        ctx.drawImage(qr, 190, 140);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '15px system-ui, sans-serif';
        ctx.fillText('WPA2 Encrypted • Auto-parsed by Scanner', 320, 464);

        return canvasToPngFile(canvas, 'sample-wifi-poster.png');
      },
    },
    {
      id: 'toolbox-url-pass',
      label: 'Toolbox URL Pass',
      demoResults: [
        {
          format: 'qr_code',
          rawValue: urlPayload,
          boundingBox: makeBox(190, 130, 260, 260),
          cornerPoints: [
            { x: 190, y: 130 },
            { x: 450, y: 130 },
            { x: 450, y: 390 },
            { x: 190, y: 390 },
          ],
        },
      ],
      buildFile: async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 500;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas unavailable');

        const grad = ctx.createLinearGradient(0, 0, 640, 500);
        grad.addColorStop(0, '#ecfeff');
        grad.addColorStop(1, '#e0f2fe');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 640, 500);

        drawRoundedRect(ctx, 170, 110, 300, 300, 24);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#0369a1';
        ctx.font = 'bold 24px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Yizzy Peasy Developer Toolbox', 320, 74);

        const qr = await renderQrCanvasElement(urlPayload, 260, '#0c4a6e');
        ctx.drawImage(qr, 190, 130);

        ctx.fillStyle = '#475569';
        ctx.font = '15px ui-monospace, monospace';
        ctx.fillText('yizzycool.github.io/tools', 320, 452);

        return canvasToPngFile(canvas, 'sample-url-pass.png');
      },
    },
  ];
}

/**
 * Interactive text receipt & engineering notes samples with calibrated bounding boxes for Text Detector.
 */
export function createTextSamples(): Array<
  DetectorSamplePreset<TextDetectionResults>
> {
  const receiptLines = [
    { text: 'YIZZY ROASTERS & CAFE', y: 92, x: 150, w: 340, h: 30 },
    { text: 'Order #2048  |  2026-11-25 09:42', y: 150, x: 120, w: 400, h: 24 },
    { text: '1x Iced Oat Cortado        $5.50', y: 215, x: 120, w: 400, h: 24 },
    { text: '1x Almond Croissant        $4.25', y: 260, x: 120, w: 400, h: 24 },
    { text: 'Subtotal                   $9.75', y: 328, x: 120, w: 400, h: 24 },
    { text: 'Total Paid (Card *4242)   $10.50', y: 375, x: 120, w: 400, h: 26 },
  ];

  const noteLines = [
    { text: 'Q4 Frontend Performance Checklist', y: 96, x: 96, w: 460, h: 30 },
    {
      text: '1. Lazy load canvas and WebGL codecs',
      y: 168,
      x: 96,
      w: 470,
      h: 24,
    },
    {
      text: '2. Keep IndexedDB writes debounced',
      y: 218,
      x: 96,
      w: 455,
      h: 24,
    },
    {
      text: '3. Verify LCP under 1.8s on mobile',
      y: 268,
      x: 96,
      w: 440,
      h: 24,
    },
    { text: 'Owner: Frontend Platform Team', y: 336, x: 96, w: 390, h: 24 },
  ];

  return [
    {
      id: 'coffee-receipt',
      label: 'Coffee Receipt',
      demoResults: receiptLines.map((line) => ({
        rawValue: line.text,
        boundingBox: makeBox(line.x, line.y - 22, line.w, line.h),
        cornerPoints: [
          { x: line.x, y: line.y - 22 },
          { x: line.x + line.w, y: line.y - 22 },
          { x: line.x + line.w, y: line.y - 22 + line.h },
          { x: line.x, y: line.y - 22 + line.h },
        ],
      })),
      buildFile: async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 460;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas unavailable');

        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(0, 0, 640, 460);

        drawRoundedRect(ctx, 88, 36, 464, 388, 16);
        ctx.fillStyle = '#fffdf8';
        ctx.fill();

        ctx.strokeStyle = '#cbd5e1';
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(116, 180);
        ctx.lineTo(524, 180);
        ctx.moveTo(116, 294);
        ctx.lineTo(524, 294);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'left';
        receiptLines.forEach((line, idx) => {
          ctx.font =
            idx === 0 || idx === receiptLines.length - 1
              ? 'bold 20px ui-monospace, monospace'
              : '18px ui-monospace, monospace';
          ctx.fillText(line.text, line.x, line.y);
        });

        return canvasToPngFile(canvas, 'sample-coffee-receipt.png');
      },
    },
    {
      id: 'sprint-notes',
      label: 'Engineering Notes',
      demoResults: noteLines.map((line) => ({
        rawValue: line.text,
        boundingBox: makeBox(line.x, line.y - 22, line.w, line.h),
        cornerPoints: [
          { x: line.x, y: line.y - 22 },
          { x: line.x + line.w, y: line.y - 22 },
          { x: line.x + line.w, y: line.y - 22 + line.h },
          { x: line.x, y: line.y - 22 + line.h },
        ],
      })),
      buildFile: async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 660;
        canvas.height = 420;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas unavailable');

        ctx.fillStyle = '#fef9c3';
        ctx.fillRect(0, 0, 660, 420);

        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 1.5;
        for (let y = 132; y < 380; y += 50) {
          ctx.beginPath();
          ctx.moveTo(72, y);
          ctx.lineTo(590, y);
          ctx.stroke();
        }

        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'left';
        noteLines.forEach((line, idx) => {
          ctx.font =
            idx === 0
              ? 'bold 24px system-ui, sans-serif'
              : '20px system-ui, sans-serif';
          ctx.fillText(line.text, line.x, line.y);
        });

        return canvasToPngFile(canvas, 'sample-sprint-notes.png');
      },
    },
  ];
}

function drawPortraitCharacter(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  shirtColor: string,
  skinColor: string,
  hairColor: string
) {
  // Shoulders
  ctx.fillStyle = shirtColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 128, 76, 56, 0, Math.PI, 0);
  ctx.fill();

  // Neck
  ctx.fillStyle = skinColor;
  ctx.fillRect(cx - 16, cy + 52, 32, 34);

  // Hair back
  ctx.fillStyle = hairColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 10, 62, 68, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 4, 52, 62, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair bangs
  ctx.fillStyle = hairColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 38, 52, 26, 0, Math.PI, 0);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(cx - 19, cy - 2, 5.5, 0, Math.PI * 2);
  ctx.arc(cx + 19, cy - 2, 5.5, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.strokeStyle = '#7c2d12';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy + 18, 16, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();
}

/**
 * Interactive portrait illustration sample with calibrated face boxes & landmarks.
 */
export function createFaceSamples(): Array<
  DetectorSamplePreset<FaceDetectionResults>
> {
  const people = [
    { cx: 150, cy: 205, shirt: '#0284c7', skin: '#fed7aa', hair: '#1e293b' },
    { cx: 360, cy: 190, shirt: '#7c3aed', skin: '#fde68a', hair: '#451a03' },
    { cx: 570, cy: 210, shirt: '#059669', skin: '#fdba74', hair: '#0f172a' },
  ];

  const demoResults: FaceDetectionResults = people.map((p) => ({
    boundingBox: makeBox(p.cx - 56, p.cy - 62, 112, 130),
    landmarks: [
      { type: 'eye', locations: [{ x: p.cx - 19, y: p.cy - 2 }] },
      { type: 'eye', locations: [{ x: p.cx + 19, y: p.cy - 2 }] },
      { type: 'mouth', locations: [{ x: p.cx, y: p.cy + 28 }] },
    ],
  }));

  return [
    {
      id: 'team-portrait',
      label: 'Team Portrait (3 Faces)',
      demoResults,
      buildFile: async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 720;
        canvas.height = 420;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas unavailable');

        const grad = ctx.createLinearGradient(0, 0, 720, 420);
        grad.addColorStop(0, '#dbeafe');
        grad.addColorStop(0.5, '#ede9fe');
        grad.addColorStop(1, '#dcfce7');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 720, 420);

        for (const p of people) {
          drawPortraitCharacter(ctx, p.cx, p.cy, p.shirt, p.skin, p.hair);
        }

        ctx.fillStyle = '#334155';
        ctx.font = '600 15px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          'Studio Team Snapshot — Try Auto Privacy Blur or Pixelate',
          360,
          390
        );

        return canvasToPngFile(canvas, 'sample-team-portrait.png');
      },
    },
  ];
}
