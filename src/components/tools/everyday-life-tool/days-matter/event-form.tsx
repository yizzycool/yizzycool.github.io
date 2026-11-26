'use client';

import type { RefObject } from 'react';
import type { MilestoneState } from './types';

import { CalendarHeart } from 'lucide-react';

import { DeleteAction, SampleAction } from '@/components/shared/action-button';
import { Chip } from '@/components/ui/chip';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

import LabelBar from '../../common/label-bar';
import { MAX_NOTE_LENGTH, MAX_TITLE_LENGTH } from './constants';
import {
  getNextNewYearDateValue,
  getRelativeDateValue,
} from './utils/date-math';

type Props = {
  state: MilestoneState;
  titleInputRef: RefObject<HTMLInputElement | null>;
  onUpdate: (patch: Partial<MilestoneState>) => void;
  onLoadSample: () => void;
  onReset: () => void;
};

/**
 * Milestone event title, target date picker, quick date presets, and optional caption inputs.
 */
export default function EventForm({
  state,
  titleInputRef,
  onUpdate,
  onLoadSample,
  onReset,
}: Props) {
  return (
    <section aria-labelledby="days-matter-event-heading" className="space-y-3">
      <LabelBar
        id="days-matter-event-heading"
        label="Event & Target Date"
        icon={CalendarHeart}
        htmlFor="days-matter-title"
      >
        <SampleAction
          label="Sample"
          successToast="Sample trip milestone loaded"
          onClick={onLoadSample}
        />
        <DeleteAction label="Reset" successToast={false} onClick={onReset} />
      </LabelBar>

      <div className="space-y-4 rounded-xl border border-neutral-200/80 bg-white/70 p-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/40">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="days-matter-title"
              className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200"
            >
              Event Title
            </label>
            <span className="font-mono text-[10px] tabular-nums text-neutral-400 dark:text-neutral-500">
              {state.title.length}/{MAX_TITLE_LENGTH}
            </span>
          </div>
          <Input
            ref={titleInputRef}
            id="days-matter-title"
            value={state.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            onClear={() => onUpdate({ title: '' })}
            placeholder="e.g. Graduation Day, Anniversary, Product Launch"
            className="font-sans text-xs"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="days-matter-date"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200"
          >
            Target Date (Past or Future)
          </label>
          <DatePicker
            id="days-matter-date"
            value={state.date}
            onChange={(date) => onUpdate({ date })}
          />

          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <Chip
              onClick={() => onUpdate({ date: getRelativeDateValue(30) })}
              className="px-2.5 py-0.5 text-[11px]"
            >
              +30 Days
            </Chip>
            <Chip
              onClick={() => onUpdate({ date: getRelativeDateValue(100) })}
              className="px-2.5 py-0.5 text-[11px]"
            >
              +100 Days
            </Chip>
            <Chip
              onClick={() => onUpdate({ date: getNextNewYearDateValue() })}
              className="px-2.5 py-0.5 text-[11px]"
            >
              Next New Year
            </Chip>
            <Chip
              onClick={() => onUpdate({ date: getRelativeDateValue(-365) })}
              className="px-2.5 py-0.5 text-[11px]"
            >
              1 Year Ago
            </Chip>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="days-matter-note"
              className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200"
            >
              Poster Caption (Optional)
            </label>
            <span className="font-mono text-[10px] tabular-nums text-neutral-400 dark:text-neutral-500">
              {state.note.length}/{MAX_NOTE_LENGTH}
            </span>
          </div>
          <Input
            id="days-matter-note"
            value={state.note}
            onChange={(e) => onUpdate({ note: e.target.value })}
            onClear={() => onUpdate({ note: '' })}
            placeholder="Short quote or reminder displayed under the counter"
            className="font-sans text-xs"
          />
        </div>

        <div className="flex items-center justify-between border-t border-neutral-200/70 pt-3 dark:border-neutral-800/70">
          <div>
            <span className="block text-xs font-medium text-neutral-700 dark:text-neutral-200">
              Show Live HH:MM:SS Breakdown
            </span>
            <span className="block text-[11px] text-neutral-500 dark:text-neutral-400">
              Display ticking hours, minutes, and seconds pill on poster
            </span>
          </div>
          <Switch
            size="sm"
            checked={state.showLiveClock}
            onChange={(showLiveClock) => onUpdate({ showLiveClock })}
          />
        </div>
      </div>
    </section>
  );
}
