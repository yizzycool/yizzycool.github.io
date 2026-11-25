import type { WifiCardLayout, WifiCardState, WifiCardTheme } from '../types';

import { WIFI_LAYOUT_DIMENSIONS } from '../constants';

const CANVAS_DIMENSIONS: Record<
  WifiCardLayout,
  { width: number; height: number }
> = {
  portrait: { width: 1050, height: 1470 },
  landscape: { width: 1470, height: 1050 },
  compact: { width: 1050, height: 1050 },
};

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawWifiSignalGlyph(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  color: string,
  scale = 1
): void {
  ctx.save();
  ctx.translate(cx, cy + 6 * scale);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = 4.5 * scale;

  const radii = [24 * scale, 16 * scale, 8.5 * scale];
  for (const radius of radii) {
    ctx.beginPath();
    ctx.arc(0, 0, radius, Math.PI * 1.25, Math.PI * 1.75);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(0, 0, 3 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const words = trimmed.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      currentLine = candidate;
    } else if (currentLine) {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length === maxLines) break;
    } else {
      lines.push(word);
      currentLine = '';
      if (lines.length === maxLines) break;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  return lines.slice(0, maxLines);
}

function drawCredentialBox(
  ctx: CanvasRenderingContext2D,
  params: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    value: string;
    theme: WifiCardTheme;
  }
): void {
  const { x, y, width, height, label, value, theme } = params;

  drawRoundedRectPath(ctx, x, y, width, height, 20);
  ctx.fillStyle = theme.surfaceBg;
  ctx.fill();
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = theme.textSecondary;
  ctx.font = '600 22px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(label.toUpperCase(), x + 28, y + 20);

  ctx.fillStyle = theme.textPrimary;
  ctx.font = '600 32px ui-monospace, SFMono-Regular, Menlo, monospace';
  const maxValueWidth = width - 56;
  let rendered = value;
  while (
    rendered.length > 3 &&
    ctx.measureText(rendered).width > maxValueWidth
  ) {
    rendered = `${rendered.slice(0, -2)}…`;
  }
  ctx.fillText(rendered, x + 28, y + 54);
}

function drawQrFrame(
  ctx: CanvasRenderingContext2D,
  qrCanvas: HTMLCanvasElement,
  params: {
    x: number;
    y: number;
    size: number;
    padding: number;
    theme: WifiCardTheme;
  }
): void {
  const { x, y, size, padding, theme } = params;
  const totalSize = size + padding * 2;

  drawRoundedRectPath(ctx, x, y, totalSize, totalSize, 32);
  ctx.fillStyle = theme.qrBg;
  ctx.fill();
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(qrCanvas, x + padding, y + padding, size, size);
  ctx.restore();
}

function formatCredentialDisplay(state: WifiCardState): {
  networkLabel: string;
  passwordLabel: string;
  passwordValue: string;
} {
  if (state.encryption === 'nopass') {
    return {
      networkLabel: 'Network Name',
      passwordLabel: 'Security',
      passwordValue: 'Open Network (No Password)',
    };
  }

  return {
    networkLabel: 'Network Name',
    passwordLabel: 'Password',
    passwordValue: state.showPassword
      ? state.password || 'No password entered'
      : '••••••••••••',
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Renders the printable Wi-Fi share card onto an offscreen high-DPI canvas.
 */
export function renderWifiCardCanvas(
  qrCanvas: HTMLCanvasElement,
  state: WifiCardState,
  theme: WifiCardTheme
): HTMLCanvasElement {
  const { width, height } = CANVAS_DIMENSIONS[state.layout];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  drawRoundedRectPath(ctx, 0, 0, width, height, 48);
  ctx.fillStyle = theme.cardBg;
  ctx.fill();
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 4;
  ctx.stroke();

  const { networkLabel, passwordLabel, passwordValue } =
    formatCredentialDisplay(state);
  const titleText = state.title.trim() || 'Welcome to Our Wi-Fi';
  const subtitleText = state.subtitle.trim();

  if (state.layout === 'portrait') {
    const cx = width / 2;

    drawRoundedRectPath(ctx, cx - 44, 72, 88, 88, 28);
    ctx.fillStyle = theme.accentSoft;
    ctx.fill();
    drawWifiSignalGlyph(ctx, cx, 118, theme.accent, 1.15);

    ctx.fillStyle = theme.textPrimary;
    ctx.font = '700 54px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const titleLines = wrapTextLines(ctx, titleText, width - 160, 2);
    titleLines.forEach((line, i) => {
      ctx.fillText(line, cx, 192 + i * 64);
    });

    const titleBottomY = 192 + Math.max(titleLines.length, 1) * 64;
    if (subtitleText) {
      ctx.fillStyle = theme.textSecondary;
      ctx.font = '400 28px system-ui, -apple-system, sans-serif';
      const subLines = wrapTextLines(ctx, subtitleText, width - 180, 2);
      subLines.forEach((line, i) => {
        ctx.fillText(line, cx, titleBottomY + 12 + i * 38);
      });
    }

    const qrSize = 460;
    const qrPadding = 34;
    const qrFrameTotal = qrSize + qrPadding * 2;
    drawQrFrame(ctx, qrCanvas, {
      x: cx - qrFrameTotal / 2,
      y: 420,
      size: qrSize,
      padding: qrPadding,
      theme,
    });

    const credY = 1005;
    const credWidth = width - 160;
    drawCredentialBox(ctx, {
      x: 80,
      y: credY,
      width: credWidth,
      height: 112,
      label: networkLabel,
      value: state.ssid.trim(),
      theme,
    });

    drawCredentialBox(ctx, {
      x: 80,
      y: credY + 132,
      width: credWidth,
      height: 112,
      label: passwordLabel,
      value: passwordValue,
      theme,
    });

    ctx.fillStyle = theme.textSecondary;
    ctx.font = '500 22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `Scan with iOS or Android camera · ${state.encryption === 'nopass' ? 'Open Wi-Fi' : `${state.encryption} Secured`}`,
      cx,
      height - 64
    );
  } else if (state.layout === 'landscape') {
    const leftX = 88;
    const leftWidth = 650;

    drawRoundedRectPath(ctx, leftX, 88, 84, 84, 24);
    ctx.fillStyle = theme.accentSoft;
    ctx.fill();
    drawWifiSignalGlyph(ctx, leftX + 42, 132, theme.accent, 1.05);

    ctx.fillStyle = theme.textPrimary;
    ctx.font = '700 54px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const titleLines = wrapTextLines(ctx, titleText, leftWidth, 2);
    titleLines.forEach((line, i) => {
      ctx.fillText(line, leftX, 204 + i * 64);
    });

    const titleBottomY = 204 + Math.max(titleLines.length, 1) * 64;
    if (subtitleText) {
      ctx.fillStyle = theme.textSecondary;
      ctx.font = '400 28px system-ui, -apple-system, sans-serif';
      const subLines = wrapTextLines(ctx, subtitleText, leftWidth, 3);
      subLines.forEach((line, i) => {
        ctx.fillText(line, leftX, titleBottomY + 16 + i * 38);
      });
    }

    drawCredentialBox(ctx, {
      x: leftX,
      y: 620,
      width: leftWidth,
      height: 112,
      label: networkLabel,
      value: state.ssid.trim(),
      theme,
    });

    drawCredentialBox(ctx, {
      x: leftX,
      y: 752,
      width: leftWidth,
      height: 112,
      label: passwordLabel,
      value: passwordValue,
      theme,
    });

    const qrSize = 510;
    const qrPadding = 38;
    const qrFrameTotal = qrSize + qrPadding * 2;
    const qrX = width - 88 - qrFrameTotal;
    const qrY = (height - qrFrameTotal) / 2 - 20;

    drawQrFrame(ctx, qrCanvas, {
      x: qrX,
      y: qrY,
      size: qrSize,
      padding: qrPadding,
      theme,
    });

    ctx.fillStyle = theme.textSecondary;
    ctx.font = '500 24px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Scan with camera to join',
      qrX + qrFrameTotal / 2,
      qrY + qrFrameTotal + 32
    );
  } else {
    const cx = width / 2;

    drawRoundedRectPath(ctx, 84, 68, 68, 68, 20);
    ctx.fillStyle = theme.accentSoft;
    ctx.fill();
    drawWifiSignalGlyph(ctx, 118, 104, theme.accent, 0.9);

    ctx.fillStyle = theme.textPrimary;
    ctx.font = '700 42px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const titleLines = wrapTextLines(ctx, titleText, width - 260, 1);
    ctx.fillText(titleLines[0] || titleText, 174, 102);

    const qrSize = 440;
    const qrPadding = 32;
    const qrFrameTotal = qrSize + qrPadding * 2;
    drawQrFrame(ctx, qrCanvas, {
      x: cx - qrFrameTotal / 2,
      y: 176,
      size: qrSize,
      padding: qrPadding,
      theme,
    });

    const boxGap = 24;
    const boxWidth = (width - 168 - boxGap) / 2;
    const credY = 740;
    drawCredentialBox(ctx, {
      x: 84,
      y: credY,
      width: boxWidth,
      height: 112,
      label: networkLabel,
      value: state.ssid.trim(),
      theme,
    });
    drawCredentialBox(ctx, {
      x: 84 + boxWidth + boxGap,
      y: credY,
      width: boxWidth,
      height: 112,
      label: passwordLabel,
      value: passwordValue,
      theme,
    });

    ctx.fillStyle = theme.textSecondary;
    ctx.font = '500 22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(
      'Point phone camera to connect automatically',
      cx,
      height - 68
    );
  }

  return canvas;
}

function sanitizeFileName(ssid: string): string {
  const cleaned = ssid
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || 'guest-wifi';
}

/**
 * Triggers a client-side PNG download of the rendered Wi-Fi card.
 */
export function downloadWifiCardPng(
  qrCanvas: HTMLCanvasElement,
  state: WifiCardState,
  theme: WifiCardTheme
): void {
  const exportCanvas = renderWifiCardCanvas(qrCanvas, state, theme);
  const dataUrl = exportCanvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `wifi-card-${sanitizeFileName(state.ssid)}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copies the rendered Wi-Fi card PNG to the system clipboard.
 */
export async function copyWifiCardPng(
  qrCanvas: HTMLCanvasElement,
  state: WifiCardState,
  theme: WifiCardTheme
): Promise<void> {
  const exportCanvas = renderWifiCardCanvas(qrCanvas, state, theme);
  const blob = await new Promise<Blob | null>((resolve) =>
    exportCanvas.toBlob((b) => resolve(b), 'image/png')
  );
  if (!blob) {
    throw new Error('Failed to encode PNG blob');
  }

  if (!navigator.clipboard || typeof window.ClipboardItem === 'undefined') {
    throw new Error('Clipboard image copy is not supported in this browser');
  }

  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}

/**
 * Opens an isolated print iframe with exact physical dimensions and optional cut guides.
 */
export function printWifiCard(
  qrCanvas: HTMLCanvasElement,
  state: WifiCardState,
  theme: WifiCardTheme
): void {
  const exportCanvas = renderWifiCardCanvas(qrCanvas, state, theme);
  const dataUrl = exportCanvas.toDataURL('image/png');
  const dims = WIFI_LAYOUT_DIMENSIONS[state.layout];

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  const cutBorder = state.showCutGuides
    ? 'border: 1.5px dashed #94a3b8; padding: 8px; border-radius: 16px;'
    : '';

  doc.open();
  doc.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Wi-Fi Card - ${escapeHtml(state.ssid.trim())}</title>
    <style>
      @page {
        margin: 0.4in;
      }
      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #ffffff;
        font-family: system-ui, -apple-system, sans-serif;
      }
      .cut-frame {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        ${cutBorder}
      }
      img {
        display: block;
        width: ${dims.widthIn};
        max-width: 100%;
        height: auto;
        object-fit: contain;
      }
      .hint {
        margin-top: 10px;
        font-size: 10px;
        color: #64748b;
      }
    </style>
  </head>
  <body>
    <div class="cut-frame">
      <img id="wifi-print-img" src="${dataUrl}" alt="Wi-Fi QR Code Card" />
    </div>
    ${state.showCutGuides ? '<p class="hint">Cut along the dashed guide line</p>' : ''}
  </body>
</html>`);
  doc.close();

  const cleanup = () => {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  };

  const img = doc.getElementById('wifi-print-img') as HTMLImageElement | null;
  const triggerPrint = () => {
    const win = iframe.contentWindow;
    if (!win) {
      cleanup();
      return;
    }
    win.addEventListener('afterprint', cleanup, { once: true });
    win.focus();
    win.print();
    window.setTimeout(cleanup, 60000);
  };

  if (img && !img.complete) {
    img.onload = triggerPrint;
  } else {
    triggerPrint();
  }
}
