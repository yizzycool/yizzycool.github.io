'use client';

import {
  CheckSquare,
  FolderSync,
  Info,
  Keyboard,
  Link2,
  Volume2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { BaseDialog, DialogHeader } from '@/components/ui/dialog';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

interface ShortcutRow {
  keys: string;
  description: string;
}

const SHORTCUT_ROWS: ShortcutRow[] = [
  { keys: '/', description: 'Focus search bar' },
  { keys: 'N', description: 'New quick note' },
  { keys: 'Mod + E', description: 'Toggle Read / Edit in modal' },
  { keys: 'Mod + Enter', description: 'Save quick capture note' },
  { keys: 'Esc', description: 'Close editor or clear search' },
  { keys: '?', description: 'Toggle global shortcut help' },
];

const INLINE_CODE_CLASS =
  'rounded bg-black/[0.06] px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-800 dark:bg-white/[0.1] dark:text-slate-100';

const SECTION_CARD_CLASS =
  'rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-800/40';

export default function NotesGuideModal({ isOpen, onClose }: Props) {
  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      dialogClassName="flex max-h-[88vh] w-full max-w-2xl flex-col"
    >
      <DialogHeader
        icon={Info}
        title="Markdown Notes Guide"
        description="Quick syntax reference, study workflows, and local-first storage tips."
        onClose={onClose}
        closeAriaLabel="Close guide dialog"
        className="mx-6 pt-6"
      />

      <div className="flex-1 space-y-3.5 overflow-y-auto px-6 py-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        {/* Markdown & Interactive Checklists */}
        <section className={SECTION_CARD_CLASS}>
          <div className="mb-2.5 flex items-center gap-2">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400">
              <CheckSquare size={14} aria-hidden="true" />
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Markdown &amp; Interactive Checklists
            </h3>
          </div>
          <ul className="space-y-1.5">
            <li>
              Full <strong>GitHub-Flavored Markdown</strong> support including
              tables, syntax-highlighted code blocks, and LaTeX math (
              <code className={INLINE_CODE_CLASS}>$inline$</code> or{' '}
              <code className={INLINE_CODE_CLASS}>$$block$$</code>).
            </li>
            <li>
              Create clickable checklists using standard{' '}
              <code className={INLINE_CODE_CLASS}>- [ ] task</code>, or type{' '}
              <code className={INLINE_CODE_CLASS}>[ ] </code> /{' '}
              <code className={INLINE_CODE_CLASS}>[] </code> /{' '}
              <code className={INLINE_CODE_CLASS}>[x] </code> at the start of a
              line to automatically expand into portable GFM syntax (compatible
              with Obsidian, GitHub, and Notion).
            </li>
            <li>
              Toggle checkboxes directly on note cards or inside Read mode
              without opening Edit mode.
            </li>
          </ul>
        </section>

        {/* Active Recall & Knowledge Graph */}
        <section className={SECTION_CARD_CLASS}>
          <div className="mb-2.5 flex items-center gap-2">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-400">
              <Link2 size={14} aria-hidden="true" />
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Active Recall &amp; Knowledge Graph
            </h3>
          </div>
          <ul className="space-y-1.5">
            <li>
              <strong>Cloze Spoilers:</strong> Wrap answers or translations in{' '}
              <code className={INLINE_CODE_CLASS}>||hidden answer||</code> to
              blur them until clicked (or reveal everything at once via the
              toolbar eye icon).
            </li>
            <li>
              <strong>Bidirectional Wiki Links:</strong> Link notes using{' '}
              <code className={INLINE_CODE_CLASS}>[[Note Title]]</code> or{' '}
              <code className={INLINE_CODE_CLASS}>[[Note Title|Alias]]</code>.
              Clicking a missing title creates the linked note; related
              references automatically appear in the <strong>Backlinks</strong>{' '}
              section.
            </li>
            <li>
              <strong>Heading Outline:</strong> H1-H3 headings automatically
              generate a quick-jump outline bar in Read and Split views.
            </li>
          </ul>
        </section>

        {/* Audio Study & Optional On-Device AI */}
        <section className={SECTION_CARD_CLASS}>
          <div className="mb-2.5 flex items-center gap-2">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400">
              <Volume2 size={14} aria-hidden="true" />
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Audio Study &amp; Optional On-Device AI
            </h3>
          </div>
          <ul className="space-y-1.5">
            <li>
              <strong>Web Speech TTS:</strong> Play any note or highlighted
              phrase via <strong>Listen</strong> with{' '}
              <code className={INLINE_CODE_CLASS}>1.0x</code> /{' '}
              <code className={INLINE_CODE_CLASS}>0.7x</code> speeds and{' '}
              <code className={INLINE_CODE_CLASS}>US</code> /{' '}
              <code className={INLINE_CODE_CLASS}>UK</code> accents.
            </li>
            <li>
              <strong>Dictionary &amp; Pronunciation:</strong> Highlight a word
              or phrase in the editor modal and open{' '}
              <strong>Cambridge Dictionary</strong> or <strong>YouGlish</strong>{' '}
              in one click.
            </li>
            <li>
              <strong>Chrome Built-in AI:</strong> When supported by your
              browser, <strong>AI Assist</strong> unlocks on-device
              summarization, rewriting, translation, and label suggestions with
              zero external API calls.
            </li>
          </ul>
        </section>

        {/* Local Privacy, Import & Folder Sync */}
        <section className={SECTION_CARD_CLASS}>
          <div className="mb-2.5 flex items-center gap-2">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400">
              <FolderSync size={14} aria-hidden="true" />
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Local Privacy, Import &amp; Folder Sync
            </h3>
          </div>
          <ul className="space-y-1.5">
            <li>
              <strong>100% Client-Side Storage:</strong> Notes stay in your
              browser&apos;s IndexedDB with zero account login or server upload.
            </li>
            <li>
              <strong>Import &amp; Backup:</strong> Selectively import Google
              Keep Takeout (<code className={INLINE_CODE_CLASS}>.zip</code> /{' '}
              <code className={INLINE_CODE_CLASS}>.json</code>) or{' '}
              <code className={INLINE_CODE_CLASS}>.md</code> files, and export
              as Markdown <code className={INLINE_CODE_CLASS}>.zip</code>, full
              JSON backup, or <code className={INLINE_CODE_CLASS}>.ics</code>{' '}
              calendar review reminders.
            </li>
            <li>
              <strong>Local Folder Sync:</strong> Connect a local vault folder
              via the File System Access API for bidirectional{' '}
              <code className={INLINE_CODE_CLASS}>.md</code> file syncing.
            </li>
          </ul>
        </section>

        {/* Keyboard Shortcuts */}
        <section className={SECTION_CARD_CLASS}>
          <div className="mb-2.5 flex items-center gap-2">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-lg bg-purple-500/15 text-purple-600 dark:bg-purple-400/15 dark:text-purple-400">
              <Keyboard size={14} aria-hidden="true" />
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Keyboard Shortcuts
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SHORTCUT_ROWS.map((item) => (
              <div
                key={item.keys}
                className="flex items-center justify-between gap-2 rounded-lg border border-black/[0.06] bg-white/70 px-2.5 py-1.5 dark:border-white/[0.07] dark:bg-neutral-900/60"
              >
                <span className="text-slate-600 dark:text-slate-300">
                  {item.description}
                </span>
                <kbd className="shrink-0 rounded border border-neutral-300/80 bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-200">
                  {item.keys}
                </kbd>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-neutral-200/80 px-6 py-3.5 dark:border-neutral-800">
        <span className="text-xs text-slate-400 dark:text-slate-500">
          All notes stay privately in your browser.
        </span>
        <Button variant="primary" size="xs" rounded="lg" onClick={onClose}>
          Got it
        </Button>
      </div>
    </BaseDialog>
  );
}
