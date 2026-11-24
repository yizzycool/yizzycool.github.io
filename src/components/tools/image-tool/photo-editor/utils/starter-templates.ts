import type {
  DocumentConfig,
  ExtendedFabricObject,
  StarterTemplateId,
} from '../types/studio';

import * as fabric from 'fabric';

type MetaStamper = (
  obj: fabric.FabricObject,
  meta?: {
    kind?: 'image' | 'text' | 'shape' | 'brush' | 'group';
    name?: string;
  }
) => string;

function makeText(
  text: string,
  opts: Partial<fabric.TextboxProps> & { fill: string; fontSize: number }
): fabric.Textbox {
  return new fabric.Textbox(text, {
    originX: 'center',
    originY: 'center',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: 'bold',
    textAlign: 'left',
    lineHeight: 1.15,
    ...opts,
  });
}

/**
 * Populate the active Fabric canvas with curated starter layout templates
 * (YouTube Thumbnail, IG Carousel, Blog OG Banner, IG Story, Product Spotlight).
 */
export function buildStarterTemplateOnCanvas(
  canvas: fabric.Canvas,
  templateId: StarterTemplateId,
  stampLayer: MetaStamper,
  applyControls: (obj: fabric.FabricObject) => void
): DocumentConfig {
  canvas.discardActiveObject();
  canvas.remove(...canvas.getObjects());

  const add = (
    obj: fabric.FabricObject,
    kind: 'text' | 'shape',
    name: string
  ) => {
    stampLayer(obj, { kind, name });
    applyControls(obj);
    canvas.add(obj);
    return obj;
  };

  if (templateId === 'youtube-thumb') {
    const config: DocumentConfig = {
      width: 1280,
      height: 720,
      backgroundType: 'color',
      backgroundColor: '#0f172a',
      backgroundOpacity: 1,
    };

    const glow = new fabric.Circle({
      left: 980,
      top: 340,
      radius: 260,
      originX: 'center',
      originY: 'center',
      fill: 'rgba(244, 63, 94, 0.22)',
      strokeWidth: 0,
    });
    add(glow, 'shape', 'Accent Glow');

    const pill = new fabric.Rect({
      left: 245,
      top: 150,
      width: 310,
      height: 54,
      rx: 27,
      ry: 27,
      originX: 'center',
      originY: 'center',
      fill: '#f43f5e',
    });
    add(pill, 'shape', 'Badge Pill');

    add(
      makeText('PRO WORKFLOW', {
        left: 245,
        top: 150,
        width: 280,
        fontSize: 26,
        fill: '#ffffff',
        textAlign: 'center',
      }),
      'text',
      'Tag Label'
    );

    add(
      makeText('MASTER AI\nPHOTO EDITING', {
        left: 420,
        top: 350,
        width: 660,
        fontSize: 96,
        fill: '#ffffff',
      }),
      'text',
      'Main Headline'
    );

    add(
      makeText('100% Browser WebGPU · Zero Uploads', {
        left: 420,
        top: 525,
        width: 660,
        fontSize: 34,
        fontWeight: 'normal',
        fill: '#cbd5e1',
      }),
      'text',
      'Subtitle'
    );

    const frame = new fabric.Rect({
      left: 970,
      top: 360,
      width: 420,
      height: 540,
      rx: 32,
      ry: 32,
      originX: 'center',
      originY: 'center',
      fill: 'rgba(255,255,255,0.08)',
      stroke: '#38bdf8',
      strokeWidth: 4,
    });
    add(frame, 'shape', 'Subject Drop Frame');

    add(
      makeText('Drop Subject\nPhoto Here', {
        left: 970,
        top: 360,
        width: 320,
        fontSize: 32,
        fill: '#7dd3fc',
        textAlign: 'center',
      }),
      'text',
      'Subject Placeholder'
    );

    return config;
  }

  if (templateId === 'ig-carousel') {
    const config: DocumentConfig = {
      width: 1080,
      height: 1350,
      backgroundType: 'color',
      backgroundColor: '#f8fafc',
      backgroundOpacity: 1,
    };

    const card = new fabric.Rect({
      left: 540,
      top: 790,
      width: 920,
      height: 760,
      rx: 40,
      ry: 40,
      originX: 'center',
      originY: 'center',
      fill: '#e0f2fe',
      stroke: '#38bdf8',
      strokeWidth: 3,
    });
    add(card, 'shape', 'Photo Card');

    const pill = new fabric.Rect({
      left: 205,
      top: 135,
      width: 240,
      height: 48,
      rx: 24,
      ry: 24,
      originX: 'center',
      originY: 'center',
      fill: '#0ea5e9',
    });
    add(pill, 'shape', 'Slide Badge');

    add(
      makeText('SLIDE 01 / 05', {
        left: 205,
        top: 135,
        width: 210,
        fontSize: 22,
        fill: '#ffffff',
        textAlign: 'center',
      }),
      'text',
      'Slide Number'
    );

    add(
      makeText('Design Tips That\nConvert Better', {
        left: 540,
        top: 280,
        width: 900,
        fontSize: 74,
        fill: '#0f172a',
      }),
      'text',
      'Carousel Title'
    );

    add(
      makeText('Swipe for breakdown →', {
        left: 540,
        top: 1255,
        width: 900,
        fontSize: 30,
        fill: '#0284c7',
        textAlign: 'center',
      }),
      'text',
      'Swipe Hint'
    );

    return config;
  }

  if (templateId === 'og-banner') {
    const config: DocumentConfig = {
      width: 1200,
      height: 630,
      backgroundType: 'color',
      backgroundColor: '#1e1b4b',
      backgroundOpacity: 1,
    };

    add(
      new fabric.Circle({
        left: 1050,
        top: 110,
        radius: 220,
        originX: 'center',
        originY: 'center',
        fill: 'rgba(99, 102, 241, 0.35)',
      }),
      'shape',
      'Top Accent'
    );

    add(
      new fabric.Rect({
        left: 215,
        top: 145,
        width: 250,
        height: 46,
        rx: 23,
        ry: 23,
        originX: 'center',
        originY: 'center',
        fill: '#6366f1',
      }),
      'shape',
      'Category Pill'
    );

    add(
      makeText('ENGINEERING BLOG', {
        left: 215,
        top: 145,
        width: 230,
        fontSize: 20,
        fill: '#ffffff',
        textAlign: 'center',
      }),
      'text',
      'Category Label'
    );

    add(
      makeText('How We Built a Local\nWebGPU Photo Studio', {
        left: 560,
        top: 325,
        width: 940,
        fontSize: 72,
        fill: '#f8fafc',
      }),
      'text',
      'Article Headline'
    );

    add(
      makeText('yizzypeasy.com · Private Browser Tools', {
        left: 560,
        top: 515,
        width: 940,
        fontSize: 28,
        fontWeight: 'normal',
        fill: '#a5b4fc',
      }),
      'text',
      'Site Footer'
    );

    return config;
  }

  if (templateId === 'ig-story') {
    const config: DocumentConfig = {
      width: 1080,
      height: 1920,
      backgroundType: 'color',
      backgroundColor: '#064e3b',
      backgroundOpacity: 1,
    };

    add(
      new fabric.Rect({
        left: 540,
        top: 960,
        width: 900,
        height: 1020,
        rx: 48,
        ry: 48,
        originX: 'center',
        originY: 'center',
        fill: 'rgba(16, 185, 129, 0.18)',
        stroke: '#34d399',
        strokeWidth: 4,
      }),
      'shape',
      'Story Photo Frame'
    );

    add(
      makeText('NEW DROP', {
        left: 540,
        top: 230,
        width: 840,
        fontSize: 40,
        fill: '#6ee7b7',
        textAlign: 'center',
      }),
      'text',
      'Kicker'
    );

    add(
      makeText('WEEKEND\nCOLLECTION', {
        left: 540,
        top: 345,
        width: 880,
        fontSize: 88,
        fill: '#ffffff',
        textAlign: 'center',
      }),
      'text',
      'Story Title'
    );

    add(
      new fabric.Rect({
        left: 540,
        top: 1690,
        width: 560,
        height: 92,
        rx: 46,
        ry: 46,
        originX: 'center',
        originY: 'center',
        fill: '#10b981',
      }),
      'shape',
      'CTA Pill'
    );

    add(
      makeText('TAP TO EXPLORE', {
        left: 540,
        top: 1690,
        width: 500,
        fontSize: 32,
        fill: '#ffffff',
        textAlign: 'center',
      }),
      'text',
      'CTA Label'
    );

    return config;
  }

  // product-spotlight
  const config: DocumentConfig = {
    width: 1080,
    height: 1080,
    backgroundType: 'color',
    backgroundColor: '#fffbeb',
    backgroundOpacity: 1,
  };

  add(
    new fabric.Circle({
      left: 540,
      top: 560,
      radius: 330,
      originX: 'center',
      originY: 'center',
      fill: '#fef3c7',
      stroke: '#f59e0b',
      strokeWidth: 4,
    }),
    'shape',
    'Spotlight Circle'
  );

  add(
    new fabric.Rect({
      left: 860,
      top: 210,
      width: 210,
      height: 68,
      rx: 34,
      ry: 34,
      originX: 'center',
      originY: 'center',
      fill: '#f59e0b',
    }),
    'shape',
    'Promo Pill'
  );

  add(
    makeText('30% OFF', {
      left: 860,
      top: 210,
      width: 180,
      fontSize: 32,
      fill: '#ffffff',
      textAlign: 'center',
    }),
    'text',
    'Promo Text'
  );

  add(
    makeText('STUDIO EDITION', {
      left: 540,
      top: 155,
      width: 820,
      fontSize: 64,
      fill: '#78350f',
      textAlign: 'center',
    }),
    'text',
    'Product Title'
  );

  void (canvas as unknown as ExtendedFabricObject);
  return config;
}
