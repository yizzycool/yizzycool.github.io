import type { HtmlEntitiesMode } from './types';

import { CodeXml, Binary } from 'lucide-react';

export const TAB_ITEMS: HtmlEntitiesMode[] = ['Encode', 'Decode'];
export const TAB_ICONS = [CodeXml, Binary];

export const SPECIAL_CHARS = new Set(['&', '<', '>', '"', "'"]);

/**
 * Standard Named HTML Entities dictionary
 */
export const NAMED_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
  '\u00A0': '&nbsp;',
  '©': '&copy;',
  '®': '&reg;',
  '™': '&trade;',
  '€': '&euro;',
  '£': '&pound;',
  '¥': '&yen;',
  '¢': '&cent;',
  '§': '&sect;',
  '¶': '&para;',
  '°': '&deg;',
  '±': '&plusmn;',
  '×': '&times;',
  '÷': '&divide;',
  'µ': '&micro;',
  '·': '&middot;',
  '«': '&laquo;',
  '»': '&raquo;',
  '—': '&mdash;',
  '–': '&ndash;',
  '…': '&hellip;',
  '•': '&bull;',
  '←': '&larr;',
  '→': '&rarr;',
  '↑': '&uarr;',
  '↓': '&darr;',
  '↔': '&harr;',
  '♠': '&spades;',
  '♣': '&clubs;',
  '♥': '&hearts;',
  '♦': '&diams;',
  '≠': '&ne;',
  '≤': '&le;',
  '≥': '&ge;',
  '∞': '&infin;',
  '≈': '&asymp;',
  '√': '&radic;',
  '∑': '&sum;',
  '∏': '&prod;',
  '∫': '&int;',
  'α': '&alpha;',
  'β': '&beta;',
  'γ': '&gamma;',
  'δ': '&delta;',
  'ε': '&epsilon;',
  'θ': '&theta;',
  'λ': '&lambda;',
  'μ': '&mu;',
  'π': '&pi;',
  'σ': '&sigma;',
  'ω': '&omega;',
};

/**
 * Reverse mapping for fast entity decoding
 */
export const REVERSE_NAMED_ENTITIES: Record<string, string> = Object.entries(
  NAMED_ENTITIES
).reduce<Record<string, string>>((acc, [char, entity]) => {
  const name = entity.slice(1, -1);
  acc[name] = char;
  return acc;
}, {});

// Additional legacy / commonly used entity synonyms
REVERSE_NAMED_ENTITIES['apos'] = "'";
REVERSE_NAMED_ENTITIES['quot'] = '"';
REVERSE_NAMED_ENTITIES['amp'] = '&';
REVERSE_NAMED_ENTITIES['lt'] = '<';
REVERSE_NAMED_ENTITIES['gt'] = '>';
REVERSE_NAMED_ENTITIES['nbsp'] = '\u00A0';

export const SAMPLE_TEXT_TO_ENCODE = `<div class="user-greeting" id="welcome">
  <h1>Hello, World! & Welcome to "HTML Entities" 🚀</h1>
  <p>Special characters: <tag>, 'quotes', 10 > 5, 2 < 8, A & B.</p>
  <p>Symbols: © 2026, 100€, ¥500, ±0.5, 90°.</p>
</div>`;

export const SAMPLE_ENTITIES_TO_DECODE = `&lt;div class=&quot;user-greeting&quot; id=&quot;welcome&quot;&gt;
  &lt;h1&gt;Hello, World! &amp; Welcome to &quot;HTML Entities&quot; &#128640;&lt;/h1&gt;
  &lt;p&gt;Special characters: &amp;lt;tag&amp;gt;, &apos;quotes&apos;, 10 &gt; 5, 2 &lt; 8, A &amp; B.&lt;/p&gt;
  &lt;p&gt;Symbols: &copy; 2026, 100&euro;, &yen;500, &plusmn;0.5, 90&deg;.&lt;/p&gt;
&lt;/div&gt;`;
