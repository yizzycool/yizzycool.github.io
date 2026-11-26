import type { CountdownBreakdown, MilestoneState, PosterTheme } from '../types';

import { POSTER_RATIO_DIMENSIONS } from '../constants';

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
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
    } else if (line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else {
      lines.push(word);
      line = '';
      if (lines.length === maxLines) break;
    }
  }

  if (line && lines.length < maxLines) {
    lines.push(line);
  }
  return lines.slice(0, maxLines);
}

function drawPill(
  ctx: CanvasRenderingContext2D,
  params: {
    cx: number;
    cy: number;
    text: string;
    bg: string;
    border: string;
    color: string;
    fontSize: number;
  }
): void {
  const { cx, cy, text, bg, border, color, fontSize } = params;
  ctx.font = `700 ${fontSize}px system-ui, -apple-system, sans-serif`;
  const textWidth = ctx.measureText(text).width;
  const padX = fontSize * 1.4;
  const height = fontSize * 2.2;
  const width = textWidth + padX * 2;

  drawRoundedRectPath(
    ctx,
    cx - width / 2,
    cy - height / 2,
    width,
    height,
    height / 2
  );
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = border;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy + 1);
}

/**
 * Renders the gradient countdown social poster onto a high-res offscreen HTML5 canvas.
 */
export function renderMilestonePosterCanvas(
  state: MilestoneState,
  theme: PosterTheme,
  breakdown: CountdownBreakdown
): HTMLCanvasElement {
  const { width, height } = POSTER_RATIO_DIMENSIONS[state.ratio];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, theme.canvasStops[0]);
  grad.addColorStop(0.52, theme.canvasStops[1]);
  grad.addColorStop(1, theme.canvasStops[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Soft ambient glow behind main counter
  const glow = ctx.createRadialGradient(
    width * 0.5,
    height * 0.44,
    20,
    width * 0.5,
    height * 0.44,
    Math.max(width, height) * 0.45
  );
  glow.addColorStop(0, theme.glowColor);
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const isWide = state.ratio === 'wide';
  const isStory = state.ratio === 'story';

  const titleText = state.title.trim();
  const dayNumberText =
    breakdown.mode === 'today' ? 'TODAY' : String(breakdown.totalDays);
  const unitLabel =
    breakdown.mode === 'today'
      ? 'IS THE DAY'
      : breakdown.totalDays === 1
        ? breakdown.mode === 'future'
          ? 'DAY LEFT'
          : 'DAY AGO'
        : breakdown.mode === 'future'
          ? 'DAYS LEFT'
          : 'DAYS AGO';

  const heroCenterY = isStory
    ? height * 0.48
    : isWide
      ? height * 0.52
      : height * 0.5;
  const heroFontSize =
    breakdown.mode === 'today' ? (isWide ? 140 : 170) : isWide ? 220 : 280;

  // Event Title grouped right above Hero Day Counter
  if (titleText) {
    ctx.fillStyle = theme.textPrimary;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = `700 ${isWide ? 54 : 60}px system-ui, -apple-system, sans-serif`;
    const titleLines = wrapTextLines(ctx, titleText, width - 180, 2);
    const titleBottomY =
      heroCenterY - 24 - heroFontSize / 2 - (isWide ? 36 : 48);
    const titleLineHeight = isWide ? 68 : 74;
    titleLines.forEach((line, i) => {
      ctx.fillText(
        line,
        cx,
        titleBottomY - (titleLines.length - 1 - i) * titleLineHeight
      );
    });
  }

  // Hero Day Counter
  ctx.fillStyle = theme.textPrimary;
  ctx.textBaseline = 'middle';
  ctx.font = `800 ${heroFontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.fillText(dayNumberText, cx, heroCenterY - 24);

  ctx.fillStyle = theme.accent;
  ctx.font = `700 ${isWide ? 28 : 32}px system-ui, -apple-system, sans-serif`;
  ctx.fillText(unitLabel, cx, heroCenterY + (isWide ? 105 : 138));

  // Optional live time breakdown strip
  if (state.showLiveClock && breakdown.mode !== 'today') {
    const timeLabel = `${String(breakdown.hours).padStart(2, '0')}h : ${String(breakdown.minutes).padStart(2, '0')}m : ${String(breakdown.seconds).padStart(2, '0')}s`;
    drawPill(ctx, {
      cx,
      cy: heroCenterY + (isWide ? 172 : 214),
      text: timeLabel,
      bg: theme.pillBg,
      border: theme.pillBorder,
      color: theme.textSecondary,
      fontSize: 24,
    });
  }

  // Note & Target Date Footer
  const noteY = isStory ? height - 350 : isWide ? height - 145 : height - 210;
  if (state.note.trim()) {
    ctx.fillStyle = theme.textSecondary;
    ctx.font = `400 ${isWide ? 26 : 30}px system-ui, -apple-system, sans-serif`;
    ctx.textBaseline = 'top';
    const noteLines = wrapTextLines(ctx, state.note, width - 220, 2);
    noteLines.forEach((line, i) => {
      ctx.fillText(line, cx, noteY + i * 40);
    });
  }

  ctx.fillStyle = theme.textSecondary;
  ctx.textBaseline = 'bottom';
  ctx.font = `600 ${isWide ? 24 : 26}px system-ui, -apple-system, sans-serif`;
  ctx.fillText(
    `${breakdown.formattedDate} · ${breakdown.weekday}`,
    cx,
    height - (isStory ? 120 : 62)
  );

  return canvas;
}

function sanitizeFileSlug(title: string): string {
  const cleaned = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || 'milestone';
}

export function downloadPosterPng(
  state: MilestoneState,
  theme: PosterTheme,
  breakdown: CountdownBreakdown
): void {
  const canvas = renderMilestonePosterCanvas(state, theme, breakdown);
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `days-matter-${sanitizeFileSlug(state.title)}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function copyPosterPng(
  state: MilestoneState,
  theme: PosterTheme,
  breakdown: CountdownBreakdown
): Promise<void> {
  const canvas = renderMilestonePosterCanvas(state, theme, breakdown);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png')
  );
  if (!blob) throw new Error('Failed to encode PNG');
  if (!navigator.clipboard || typeof window.ClipboardItem === 'undefined') {
    throw new Error('Clipboard image copy is unsupported');
  }
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}
