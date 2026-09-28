'use client';

import { BookOpen } from 'lucide-react';
import { BaseDialog, DialogHeader } from '@/components/ui/dialog';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function DiffDialog({ isOpen, onClose }: Props) {
  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      dialogClassName="flex max-h-[85vh] w-full max-w-2xl flex-col"
    >
      <DialogHeader
        icon={BookOpen}
        title="Base64 vs Base64URL"
        description="Character mappings, padding rules, and web URL safety."
        onClose={onClose}
        closeAriaLabel="Close comparison dialog"
        className="mx-6 pt-6"
      />

      <div className="flex-1 space-y-6 overflow-y-auto p-6 pt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        {/* Quick Comparison Table */}
        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-semibold tracking-wider text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
              <tr>
                <th className="px-4 py-2.5">Feature</th>
                <th className="px-4 py-2.5">Standard Base64</th>
                <th className="px-4 py-2.5 text-sky-600 dark:text-sky-400">
                  Base64URL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px] dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2 font-sans font-medium text-slate-700 dark:text-slate-200">
                  Specification
                </td>
                <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                  RFC 4648 §4
                </td>
                <td className="px-4 py-2 font-semibold text-sky-600 dark:text-sky-400">
                  RFC 4648 §5
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-sans font-medium text-slate-700 dark:text-slate-200">
                  Char 62
                </td>
                <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
                  +
                </td>
                <td className="px-4 py-2 font-semibold text-sky-600 dark:text-sky-400">
                  -
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-sans font-medium text-slate-700 dark:text-slate-200">
                  Char 63
                </td>
                <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
                  /
                </td>
                <td className="px-4 py-2 font-semibold text-sky-600 dark:text-sky-400">
                  _
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-sans font-medium text-slate-700 dark:text-slate-200">
                  Padding
                </td>
                <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
                  = (Required)
                </td>
                <td className="px-4 py-2 font-semibold text-sky-600 dark:text-sky-400">
                  Omitted
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-sans font-medium text-slate-700 dark:text-slate-200">
                  URL Safe
                </td>
                <td className="px-4 py-2 text-slate-500">
                  Requires URL encoding
                </td>
                <td className="px-4 py-2 font-semibold text-sky-600 dark:text-sky-400">
                  Yes (Native safe)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Breakdown Section */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Why Standard Base64 Fails in URLs
          </h4>

          <div className="space-y-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                1. Plus Sign (+) is Decoded as a Space
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Web application servers decode the{' '}
                <code className="rounded bg-slate-200/80 px-1 py-0.5 font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  +
                </code>{' '}
                in URL query parameters as a whitespace character (
                <code className="font-mono text-slate-500">&quot; &quot;</code>
                ), causing token corruption. Base64URL replaces{' '}
                <code className="font-mono">+</code> with{' '}
                <code className="font-mono text-sky-600 dark:text-sky-400">
                  -
                </code>{' '}
                to ensure bit-exact transmission.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                2. Slash (/) Conflicts with URL Path Routing
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                In URL paths,{' '}
                <code className="rounded bg-slate-200/80 px-1 py-0.5 font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  /
                </code>{' '}
                acts as a directory delimiter. Including it inside an identifier
                breaks routing and triggers 404 errors. Base64URL safely
                substitutes <code className="font-mono">/</code> with{' '}
                <code className="font-mono text-sky-600 dark:text-sky-400">
                  _
                </code>
                .
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                3. Padding (=) is Redundant and Clashes with Query Syntax
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                The equals sign{' '}
                <code className="rounded bg-slate-200/80 px-1 py-0.5 font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  =
                </code>{' '}
                separates query parameter keys and values. Trailing{' '}
                <code className="font-mono">=</code> padding can cause parser
                issues or require percent-encoding (
                <code className="font-mono text-slate-500">%3D</code>). Decoders
                infer missing bytes by length modulo 4, making padding
                unnecessary.
              </p>
            </div>
          </div>
        </div>

        {/* Common Standards */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/40">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200">
            Where Base64URL is Required
          </h4>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-slate-600 dark:text-slate-400">
            <li>
              <strong className="text-slate-700 dark:text-slate-300">
                JWT (JSON Web Tokens)
              </strong>
              : Headers, payloads, and signatures strictly use Base64URL.
            </li>
            <li>
              <strong className="text-slate-700 dark:text-slate-300">
                OAuth 2.0 PKCE
              </strong>
              : Code verifiers and challenge tokens.
            </li>
            <li>
              <strong className="text-slate-700 dark:text-slate-300">
                WebAuthn / Passkeys
              </strong>
              : Credential IDs and public key challenges.
            </li>
          </ul>
        </div>
      </div>
    </BaseDialog>
  );
}
