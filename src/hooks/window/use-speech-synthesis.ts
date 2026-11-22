'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

export interface SpeakOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

const SHORT_LANG_LOCALE_MAP: Record<string, string> = {
  'zh-hant': 'zh-TW',
  'zh-tw': 'zh-TW',
  'zh-hans': 'zh-CN',
  'zh-cn': 'zh-CN',
  'zh': 'zh-CN',
  'zh-hk': 'zh-HK',
  'en': 'en-US',
  'ja': 'ja-JP',
  'ko': 'ko-KR',
  'fr': 'fr-FR',
  'de': 'de-DE',
  'es': 'es-ES',
  'it': 'it-IT',
  'pt': 'pt-BR',
  'ru': 'ru-RU',
  'ar': 'ar-SA',
  'hi': 'hi-IN',
  'th': 'th-TH',
  'vi': 'vi-VN',
  'id': 'id-ID',
  'nl': 'nl-NL',
  'pl': 'pl-PL',
  'tr': 'tr-TR',
  'uk': 'uk-UA',
  'sv': 'sv-SE',
  'da': 'da-DK',
  'fi': 'fi-FI',
  'no': 'nb-NO',
  'he': 'he-IL',
  'cs': 'cs-CZ',
  'el': 'el-GR',
  'hu': 'hu-HU',
  'ro': 'ro-RO',
  'sk': 'sk-SK',
  'bg': 'bg-BG',
  'hr': 'hr-HR',
  'sl': 'sl-SI',
  'lt': 'lt-LT',
  'bn': 'bn-IN',
  'ta': 'ta-IN',
  'te': 'te-IN',
  'mr': 'mr-IN',
  'kn': 'kn-IN',
};

// macOS novelty / Eloquence voices sorted alphabetically ahead of natural voices (e.g. "Albert")
const NOVELTY_VOICE_PATTERN =
  /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|junior|organ|pipe organ|princess|superstar|trinoids|whisper|wobble|zarvox|eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley|fred|ralph|kathy|bruce|agnes|vicki)\b/i;

const LOW_QUALITY_VOICE_PATTERN = /\b(espeak|compact)\b/i;
const PREMIUM_VOICE_PATTERN = /\b(natural|neural|premium|enhanced|online)\b/i;
const GOOGLE_VOICE_PATTERN = /\bgoogle\b/i;
const PREFERRED_OS_VOICE_PATTERN =
  /\b(samantha|alex|ava|allison|zoe|nicky|aaron|daniel|serena|martha|arthur|karen|moira|tessa|meijia|mei-jia|tingting|ting-ting|sinji|sin-ji|kyoko|otoya|yuna|amelie|thomas|anna|monica|paulina|luciana|alice|aria|jenny|guy|zira|david|hsiaochen|yunjhe|xiaoxiao|nanami|sunhi)\b/i;

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function getServerSnapshot() {
  return false;
}

/**
 * Normalizes a BCP-47 language or script tag into a concrete TTS locale string.
 */
export function normalizeSpeechLang(lang?: string): string | undefined {
  const cleaned = lang?.trim().replace(/_/g, '-');
  if (!cleaned) return undefined;

  const mapped = SHORT_LANG_LOCALE_MAP[cleaned.toLowerCase()];
  return mapped ?? cleaned;
}

/**
 * Selects the highest-quality native or online SpeechSynthesisVoice matching a target locale,
 * filtering out novelty/joke system voices (such as macOS "Albert") that appear first alphabetically.
 */
export function selectBestVoice(
  voices: SpeechSynthesisVoice[],
  lang?: string
): SpeechSynthesisVoice | null {
  const normalizedTarget = normalizeSpeechLang(lang);
  if (!normalizedTarget || voices.length === 0) return null;

  const target = normalizedTarget.toLowerCase();
  const targetBase = target.split('-')[0];

  let bestVoice: SpeechSynthesisVoice | null = null;
  let bestScore = 0;

  for (const voice of voices) {
    const vLang = voice.lang.replace(/_/g, '-').toLowerCase();
    const vBase = vLang.split('-')[0];

    const isFamilyMatch =
      vBase === targetBase ||
      (targetBase === 'nb' && vBase === 'no') ||
      (targetBase === 'he' && vBase === 'iw');

    if (!isFamilyMatch) continue;

    let score = 0;

    if (vLang === target) {
      score += 100;
    } else if (targetBase === 'zh') {
      if (target === 'zh-tw') {
        score += vLang === 'zh-hk' ? 50 : 15;
      } else if (target === 'zh-cn') {
        score += 15;
      } else {
        score += 30;
      }
    } else {
      score += 30;
    }

    if (NOVELTY_VOICE_PATTERN.test(voice.name)) {
      score -= 1000;
    }
    if (LOW_QUALITY_VOICE_PATTERN.test(voice.name)) {
      score -= 40;
    }
    if (PREMIUM_VOICE_PATTERN.test(voice.name)) {
      score += 50;
    }
    if (GOOGLE_VOICE_PATTERN.test(voice.name)) {
      score += 40;
    }
    if (PREFERRED_OS_VOICE_PATTERN.test(voice.name)) {
      score += 35;
    }
    if (voice.default) {
      score += 15;
    }

    if (score > bestScore) {
      bestScore = score;
      bestVoice = voice;
    }
  }

  return bestScore > 0 ? bestVoice : null;
}

/**
 * Shared Web Speech API text-to-speech hook with locale normalization,
 * natural voice ranking, and cancellation race-condition protection.
 */
export default function useSpeechSynthesis() {
  const isSupported = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const utteranceIdRef = useRef(0);
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    if (!isSupported) return;

    let cancelled = false;
    const syncVoices = () => {
      if (cancelled) return;
      const list = window.speechSynthesis.getVoices();
      voicesRef.current = list;
      setVoices(list);
    };

    void Promise.resolve().then(syncVoices);
    window.speechSynthesis.addEventListener?.('voiceschanged', syncVoices);

    return () => {
      cancelled = true;
      window.speechSynthesis.removeEventListener?.('voiceschanged', syncVoices);
    };
  }, [isSupported]);

  const stop = useCallback(() => {
    utteranceIdRef.current += 1;
    isSpeakingRef.current = false;
    setIsSpeaking(false);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speak = useCallback(
    (text: string, options: SpeakOptions = {}) => {
      const cleanedText = text.trim();
      if (!isSupported || !cleanedText) return;

      const currentId = ++utteranceIdRef.current;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      const normalizedLang = normalizeSpeechLang(options.lang);

      if (normalizedLang) {
        utterance.lang = normalizedLang;
      }
      utterance.rate = options.rate ?? 1;
      utterance.pitch = options.pitch ?? 1;
      utterance.volume = options.volume ?? 1;

      const freshVoices = window.speechSynthesis.getVoices();
      const latestVoices =
        freshVoices.length > 0 ? freshVoices : voicesRef.current;
      const matchedVoice = selectBestVoice(latestVoices, normalizedLang);

      if (matchedVoice) {
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang || normalizedLang || utterance.lang;
      }

      utterance.onstart = () => {
        if (utteranceIdRef.current !== currentId) return;
        isSpeakingRef.current = true;
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        if (utteranceIdRef.current !== currentId) return;
        isSpeakingRef.current = false;
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        if (utteranceIdRef.current !== currentId) return;
        isSpeakingRef.current = false;
        setIsSpeaking(false);
      };

      isSpeakingRef.current = true;
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [isSupported]
  );

  useEffect(() => {
    return () => {
      if (
        isSpeakingRef.current &&
        typeof window !== 'undefined' &&
        'speechSynthesis' in window
      ) {
        isSpeakingRef.current = false;
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isSupported,
    isSpeaking,
    voices,
    speak,
    stop,
  };
}
