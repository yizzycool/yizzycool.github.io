'use client';

import type { RefObject } from 'react';
import type { WifiCardState, WifiEncryption } from './types';

import { useState } from 'react';
import { Eye, EyeOff, Wifi } from 'lucide-react';

import { DeleteAction, SampleAction } from '@/components/shared/action-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Selector } from '@/components/ui/selector';
import { Switch } from '@/components/ui/switch';

import LabelBar from '../../common/label-bar';
import { WIFI_ENCRYPTION_OPTIONS } from './constants';

type Props = {
  state: WifiCardState;
  ssidInputRef: RefObject<HTMLInputElement | null>;
  onUpdate: (patch: Partial<WifiCardState>) => void;
  onLoadSample: () => void;
  onReset: () => void;
};

/**
 * Network credential form for Wi-Fi SSID, password, encryption type, and hidden SSID toggle.
 */
export default function WifiForm({
  state,
  ssidInputRef,
  onUpdate,
  onLoadSample,
  onReset,
}: Props) {
  const [revealInputPassword, setRevealInputPassword] = useState(false);
  const hasCredentials = Boolean(state.ssid || state.password);

  return (
    <section aria-labelledby="wifi-credentials-heading" className="space-y-3">
      <LabelBar
        id="wifi-credentials-heading"
        label="Wi-Fi Credentials"
        icon={Wifi}
        htmlFor="wifi-card-ssid"
      >
        <SampleAction
          label="Load Sample"
          successToast="Sample Wi-Fi card loaded"
          onClick={onLoadSample}
        />
        <DeleteAction
          label="Reset"
          disabled={!hasCredentials}
          successToast="Wi-Fi card reset"
          onClick={onReset}
        />
      </LabelBar>

      <div className="space-y-4 rounded-xl border border-neutral-200/80 bg-white/70 p-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/40">
        <div className="space-y-1.5">
          <label
            htmlFor="wifi-card-ssid"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200"
          >
            Network Name (SSID)
          </label>
          <Input
            ref={ssidInputRef}
            id="wifi-card-ssid"
            value={state.ssid}
            onChange={(e) => onUpdate({ ssid: e.target.value })}
            onClear={() => onUpdate({ ssid: '' })}
            placeholder="e.g. Studio_Guest_5G"
            className="text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <span className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200">
            Security Protocol
          </span>
          <Selector
            size="sm"
            options={WIFI_ENCRYPTION_OPTIONS}
            value={state.encryption}
            onChange={(val) => onUpdate({ encryption: val as WifiEncryption })}
          />
        </div>

        {state.encryption !== 'nopass' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="wifi-card-password"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200"
              >
                Wi-Fi Password
              </label>
              <Button
                variant="ghost"
                size="xs"
                icon={revealInputPassword ? EyeOff : Eye}
                onClick={() => setRevealInputPassword((prev) => !prev)}
                className="h-6 px-2 text-[11px] text-neutral-500"
                ariaLabel={
                  revealInputPassword
                    ? 'Mask password input'
                    : 'Show password input'
                }
              >
                {revealInputPassword ? 'Hide' : 'Show'}
              </Button>
            </div>
            <Input
              id="wifi-card-password"
              type={revealInputPassword ? 'text' : 'password'}
              value={state.password}
              onChange={(e) => onUpdate({ password: e.target.value })}
              onClear={() => onUpdate({ password: '' })}
              placeholder="Enter guest Wi-Fi password"
              className="font-mono text-xs"
            />
          </div>
        )}

        <div className="flex items-center justify-between border-t border-neutral-200/70 pt-3 dark:border-neutral-800/70">
          <div>
            <span className="block text-xs font-medium text-neutral-700 dark:text-neutral-200">
              Hidden SSID Network
            </span>
            <span className="block text-[11px] text-neutral-500 dark:text-neutral-400">
              Include hidden flag for non-broadcast networks
            </span>
          </div>
          <Switch
            size="sm"
            checked={state.hidden}
            onChange={(hidden) => onUpdate({ hidden })}
          />
        </div>
      </div>
    </section>
  );
}
