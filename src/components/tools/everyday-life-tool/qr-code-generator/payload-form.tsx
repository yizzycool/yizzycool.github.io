'use client';

import type { RefObject } from 'react';
import type {
  EmailPayload,
  QrPayloadType,
  VCardPayload,
  WifiPayload,
} from './utils/qr-payload';

import { Contact, Link, Mail, Wifi } from 'lucide-react';

import { DeleteAction, PasteAction } from '@/components/shared/action-button';
import { Input } from '@/components/ui/input';
import { Selector } from '@/components/ui/selector';
import { Switch } from '@/components/ui/switch';
import { Tabs } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

import LabelBar from '../../common/label-bar';

const PAYLOAD_TABS: QrPayloadType[] = ['text', 'wifi', 'vcard', 'email'];

const PAYLOAD_LABELS: Record<QrPayloadType, string> = {
  text: 'URL / Text',
  wifi: 'Wi-Fi',
  vcard: 'vCard',
  email: 'Email',
};

const PAYLOAD_ICONS = {
  text: Link,
  wifi: Wifi,
  vcard: Contact,
  email: Mail,
};

const ENCRYPTION_OPTIONS = [
  { label: 'WPA / WPA2 / WPA3', value: 'WPA' },
  { label: 'WEP', value: 'WEP' },
  { label: 'No Password (Open)', value: 'nopass' },
];

type Props = {
  payloadType: QrPayloadType;
  onChangePayloadType: (next: QrPayloadType) => void;
  inputText: string;
  onChangeInputText: (value: string) => void;
  onClearText: () => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  wifi: WifiPayload;
  onChangeWifi: (patch: Partial<WifiPayload>) => void;
  vcard: VCardPayload;
  onChangeVCard: (patch: Partial<VCardPayload>) => void;
  email: EmailPayload;
  onChangeEmail: (patch: Partial<EmailPayload>) => void;
};

/**
 * Structured QR payload builder supporting raw URL/Text, Wi-Fi, vCard, and Email templates.
 */
export default function PayloadForm({
  payloadType,
  onChangePayloadType,
  inputText,
  onChangeInputText,
  onClearText,
  inputRef,
  wifi,
  onChangeWifi,
  vcard,
  onChangeVCard,
  email,
  onChangeEmail,
}: Props) {
  return (
    <div className="space-y-4">
      <Tabs<QrPayloadType>
        tabs={PAYLOAD_TABS}
        activeTab={payloadType}
        onChange={onChangePayloadType}
        tabLabels={PAYLOAD_LABELS}
        tabIcons={PAYLOAD_ICONS}
        size="xs"
        variant="segment"
        fullWidth
      />

      {payloadType === 'text' && (
        <div className="space-y-2">
          <LabelBar label="Content or URL" icon={Link} htmlFor="url-textarea">
            <PasteAction onClick={onChangeInputText} />
            <DeleteAction onClick={onClearText} disabled={!inputText} />
          </LabelBar>
          <Textarea
            ref={inputRef}
            id="url-textarea"
            placeholder="Enter URL or text to generate your QR Code..."
            onChange={(e) => onChangeInputText(e.target.value)}
            value={inputText}
            rows={5}
          />
        </div>
      )}

      {payloadType === 'wifi' && (
        <div className="space-y-3 rounded-xl border border-neutral-200/80 bg-white/70 p-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/40">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label
                htmlFor="qr-wifi-ssid"
                className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
              >
                Network Name (SSID)
              </label>
              <Input
                id="qr-wifi-ssid"
                value={wifi.ssid}
                onChange={(e) => onChangeWifi({ ssid: e.target.value })}
                placeholder="MyHomeWiFi"
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                Security
              </label>
              <Selector
                size="sm"
                options={ENCRYPTION_OPTIONS}
                value={wifi.encryption}
                onChange={(val) =>
                  onChangeWifi({
                    encryption: val as WifiPayload['encryption'],
                  })
                }
              />
            </div>
          </div>

          {wifi.encryption !== 'nopass' && (
            <div className="space-y-1">
              <label
                htmlFor="qr-wifi-password"
                className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
              >
                Password
              </label>
              <Input
                id="qr-wifi-password"
                type="text"
                value={wifi.password}
                onChange={(e) => onChangeWifi({ password: e.target.value })}
                placeholder="Enter Wi-Fi password"
                className="font-mono text-xs"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Hidden SSID network
            </span>
            <Switch
              size="sm"
              checked={wifi.hidden}
              onChange={(hidden) => onChangeWifi({ hidden })}
            />
          </div>
        </div>
      )}

      {payloadType === 'vcard' && (
        <div className="space-y-3 rounded-xl border border-neutral-200/80 bg-white/70 p-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/40">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label
                htmlFor="qr-vcard-first"
                className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
              >
                First Name
              </label>
              <Input
                id="qr-vcard-first"
                value={vcard.firstName}
                onChange={(e) => onChangeVCard({ firstName: e.target.value })}
                placeholder="Alex"
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="qr-vcard-last"
                className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
              >
                Last Name
              </label>
              <Input
                id="qr-vcard-last"
                value={vcard.lastName}
                onChange={(e) => onChangeVCard({ lastName: e.target.value })}
                placeholder="Chen"
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="qr-vcard-phone"
                className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
              >
                Phone Number
              </label>
              <Input
                id="qr-vcard-phone"
                value={vcard.phone}
                onChange={(e) => onChangeVCard({ phone: e.target.value })}
                placeholder="+886 912 345 678"
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="qr-vcard-email"
                className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
              >
                Email
              </label>
              <Input
                id="qr-vcard-email"
                type="email"
                value={vcard.email}
                onChange={(e) => onChangeVCard({ email: e.target.value })}
                placeholder="alex@example.com"
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="qr-vcard-company"
                className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
              >
                Company
              </label>
              <Input
                id="qr-vcard-company"
                value={vcard.company}
                onChange={(e) => onChangeVCard({ company: e.target.value })}
                placeholder="Yizzy Studio"
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="qr-vcard-website"
                className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
              >
                Website
              </label>
              <Input
                id="qr-vcard-website"
                value={vcard.website}
                onChange={(e) => onChangeVCard({ website: e.target.value })}
                placeholder="https://example.com"
                className="text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {payloadType === 'email' && (
        <div className="space-y-3 rounded-xl border border-neutral-200/80 bg-white/70 p-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/40">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label
                htmlFor="qr-email-to"
                className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
              >
                Recipient Email
              </label>
              <Input
                id="qr-email-to"
                type="email"
                value={email.to}
                onChange={(e) => onChangeEmail({ to: e.target.value })}
                placeholder="hello@example.com"
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="qr-email-subject"
                className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
              >
                Subject (Optional)
              </label>
              <Input
                id="qr-email-subject"
                value={email.subject}
                onChange={(e) => onChangeEmail({ subject: e.target.value })}
                placeholder="Quick Inquiry"
                className="text-xs"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="qr-email-body"
              className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
            >
              Message Body (Optional)
            </label>
            <Textarea
              id="qr-email-body"
              rows={3}
              value={email.body}
              onChange={(e) => onChangeEmail({ body: e.target.value })}
              placeholder="Write pre-filled email body..."
              className="text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
