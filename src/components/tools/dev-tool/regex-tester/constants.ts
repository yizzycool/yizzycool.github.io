export interface RegexPreset {
  id: string;
  name: string;
  description: string;
  pattern: string;
  flags: string;
  sampleText: string;
}

export const CUSTOM_PRESET_ID = 'custom';

export const CUSTOM_PRESET: RegexPreset = {
  id: CUSTOM_PRESET_ID,
  name: 'Custom Pattern',
  description: 'Custom regular expression test pattern',
  pattern: '',
  flags: 'g',
  sampleText: '',
};

export const REGEX_PRESETS: RegexPreset[] = [
  {
    id: 'email',
    name: 'Email Address',
    description: 'Matches standard email addresses (e.g. user@domain.com)',
    pattern: '([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\\.([a-zA-Z]{2,})',
    flags: 'g',
    sampleText:
      'Contact us at support@example.com or info@web.org for assistance. Invalid: test@.com',
  },
  {
    id: 'url',
    name: 'URL / Web Link',
    description: 'Matches HTTP/HTTPS web links with optional path and queries',
    pattern:
      'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)',
    flags: 'gi',
    sampleText:
      'Visit https://example.com/docs or http://www.test.org?search=regex for full documentation.',
  },
  {
    id: 'ipv4',
    name: 'IPv4 Address',
    description: 'Matches 0.0.0.0 to 255.255.255.255 IP addresses',
    pattern: '\\b\\d{1,3}(?:\\.\\d{1,3}){3}\\b',
    flags: 'g',
    sampleText:
      'Server IPs: 192.168.1.1, 10.0.0.254, and DNS 8.8.8.8 (Invalid: 999.1.2.3)',
  },
  {
    id: 'date-iso',
    name: 'Date (YYYY-MM-DD)',
    description:
      'Matches ISO dates with capture groups for Year, Month, and Day',
    pattern:
      '(?<year>\\d{4})-(?<month>0[1-9]|1[0-2])-(?<day>0[1-9]|[12]\\d|3[01])',
    flags: 'g',
    sampleText:
      'Released on 2026-09-14, next milestone is scheduled on 2026-12-31.',
  },
  {
    id: 'hex-color',
    name: 'HEX Color Code',
    description: 'Matches 3 or 6 digit hex color codes (#FFF or #10B981)',
    pattern: '#(?:[a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\b',
    flags: 'gi',
    sampleText:
      'Brand colors: #0ea5e9 (sky), #10B981 (emerald), #F43F5E (rose), and #fff (white).',
  },
  {
    id: 'password',
    name: 'Strong Password Rule',
    description:
      'At least 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char',
    pattern:
      '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    flags: 'gm',
    sampleText: 'Passw0rd!\nweakpass\nValid#2026Sec\nPass$12345678',
  },
];

export interface CheatSheetItem {
  token: string;
  label: string;
  description: string;
}

export interface CheatSheetCategory {
  title: string;
  items: CheatSheetItem[];
}

export const CHEAT_SHEET_CATEGORIES: CheatSheetCategory[] = [
  {
    title: 'Character Classes',
    items: [
      { token: '\\d', label: '\\d', description: 'Any digit (0-9)' },
      { token: '\\D', label: '\\D', description: 'Non-digit character' },
      {
        token: '\\w',
        label: '\\w',
        description: 'Word character (a-z, A-Z, 0-9, _)',
      },
      { token: '\\W', label: '\\W', description: 'Non-word character' },
      {
        token: '\\s',
        label: '\\s',
        description: 'Whitespace (space, tab, newline)',
      },
      { token: '\\S', label: '\\S', description: 'Non-whitespace character' },
      { token: '.', label: '.', description: 'Any character except newline' },
      {
        token: '[abc]',
        label: '[abc]',
        description: 'Any character in set (a, b, or c)',
      },
      {
        token: '[^abc]',
        label: '[^abc]',
        description: 'Any character not in set',
      },
      {
        token: '[a-z]',
        label: '[a-z]',
        description: 'Character in range a to z',
      },
    ],
  },
  {
    title: 'Anchors & Boundaries',
    items: [
      { token: '^', label: '^', description: 'Start of string or line' },
      { token: '$', label: '$', description: 'End of string or line' },
      { token: '\\b', label: '\\b', description: 'Word boundary' },
      { token: '\\B', label: '\\B', description: 'Non-word boundary' },
    ],
  },
  {
    title: 'Quantifiers',
    items: [
      { token: '*', label: '*', description: '0 or more occurrences' },
      { token: '+', label: '+', description: '1 or more occurrences' },
      { token: '?', label: '?', description: '0 or 1 occurrence (optional)' },
      { token: '{3}', label: '{3}', description: 'Exactly 3 occurrences' },
      {
        token: '{2,5}',
        label: '{2,5}',
        description: 'Between 2 and 5 occurrences',
      },
      { token: '{2,}', label: '{2,}', description: '2 or more occurrences' },
      {
        token: '+?',
        label: '+?',
        description: 'Lazy quantifier (matches minimum)',
      },
    ],
  },
  {
    title: 'Groups & Lookaround',
    items: [
      { token: '(...)', label: '(...)', description: 'Capturing group' },
      {
        token: '(?:...)',
        label: '(?:...)',
        description: 'Non-capturing group',
      },
      {
        token: '(?<name>...)',
        label: '(?<name>...)',
        description: 'Named capturing group',
      },
      { token: 'a|b', label: 'a|b', description: 'Matches either a or b' },
      { token: '(?=...)', label: '(?=...)', description: 'Positive lookahead' },
      { token: '(?!...)', label: '(?!...)', description: 'Negative lookahead' },
    ],
  },
];
