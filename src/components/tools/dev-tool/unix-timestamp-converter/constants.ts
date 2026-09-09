export type TimestampUnitMode = 'auto' | 'seconds' | 'milliseconds';

export const UNIT_MODES: TimestampUnitMode[] = [
  'auto',
  'seconds',
  'milliseconds',
];

export const UNIT_MODE_LABELS: Record<TimestampUnitMode, string> = {
  auto: 'Auto',
  seconds: 'Sec (10d)',
  milliseconds: 'Ms (13d)',
};

export type TimezoneMode = 'local' | 'utc';

export const TIMEZONE_MODES: TimezoneMode[] = ['local', 'utc'];

export const TIMEZONE_MODE_LABELS: Record<TimezoneMode, string> = {
  local: 'Local Time',
  utc: 'UTC (GMT)',
};

export type WorldTimezoneItem = {
  id: string;
  name: string;
  city: string;
  timezone: string;
  utcOffsetHint: string;
};

export const WORLD_TIMEZONES: WorldTimezoneItem[] = [
  {
    id: 'utc',
    name: 'Universal Time',
    city: 'UTC / GMT',
    timezone: 'UTC',
    utcOffsetHint: 'UTC+0',
  },
  {
    id: 'taipei',
    name: 'Taipei (CST)',
    city: 'Taipei, TW',
    timezone: 'Asia/Taipei',
    utcOffsetHint: 'UTC+8',
  },
  {
    id: 'tokyo',
    name: 'Tokyo (JST)',
    city: 'Tokyo, JP',
    timezone: 'Asia/Tokyo',
    utcOffsetHint: 'UTC+9',
  },
  {
    id: 'london',
    name: 'London (GMT/BST)',
    city: 'London, UK',
    timezone: 'Europe/London',
    utcOffsetHint: 'UTC+0/+1',
  },
  {
    id: 'new_york',
    name: 'New York (EST/EDT)',
    city: 'New York, US',
    timezone: 'America/New_York',
    utcOffsetHint: 'UTC-5/-4',
  },
  {
    id: 'los_angeles',
    name: 'Los Angeles (PST/PDT)',
    city: 'Los Angeles, US',
    timezone: 'America/Los_Angeles',
    utcOffsetHint: 'UTC-8/-7',
  },
  {
    id: 'sydney',
    name: 'Sydney (AEST/AEDT)',
    city: 'Sydney, AU',
    timezone: 'Australia/Sydney',
    utcOffsetHint: 'UTC+10/+11',
  },
];

export type TimeIntervalItem = {
  unit: string;
  seconds: number;
  milliseconds: number;
  readable: string;
};

export const TIME_INTERVALS: TimeIntervalItem[] = [
  { unit: '1 Minute', seconds: 60, milliseconds: 60_000, readable: '60 s' },
  {
    unit: '1 Hour',
    seconds: 3_600,
    milliseconds: 3_600_000,
    readable: '3,600 s',
  },
  {
    unit: '1 Day',
    seconds: 86_400,
    milliseconds: 86_400_000,
    readable: '86,400 s',
  },
  {
    unit: '1 Week',
    seconds: 604_800,
    milliseconds: 604_800_000,
    readable: '7 days',
  },
  {
    unit: '30 Days (Month)',
    seconds: 2_592_000,
    milliseconds: 2_592_000_000,
    readable: '30 days',
  },
  {
    unit: '365 Days (Year)',
    seconds: 31_536_000,
    milliseconds: 31_536_000_000,
    readable: '365 days',
  },
];

export const QUICK_OFFSETS = [
  { label: '-1d', seconds: -86400 },
  { label: '-1h', seconds: -3600 },
  { label: '+1h', seconds: 3600 },
  { label: '+1d', seconds: 86400 },
  { label: '+7d', seconds: 604800 },
  { label: '+30d', seconds: 2592000 },
];
