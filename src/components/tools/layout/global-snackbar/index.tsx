'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import type { ToastEventDetail } from '@/utils/toast';
import customEventUtils, { CustomEvents } from '@/utils/custom-event-utils';
import { Snackbar, useSnackbar } from '@/components/ui/snackbar';

export default function GlobalSnackbar() {
  const { snackbars, triggerSnackbar, removeSnackbar, clearAll } =
    useSnackbar();
  const pathname = usePathname();

  // Clear notifications when navigating between pages
  useEffect(() => {
    clearAll();
  }, [pathname, clearAll]);

  // Listen to global toast events
  useEffect(() => {
    const unsubTrigger = customEventUtils.on(
      CustomEvents.common.triggerSnackbar,
      (e: CustomEvent<ToastEventDetail>) => {
        if (!e.detail) return;
        const { content, ...rest } = e.detail;
        if (!content) return;
        triggerSnackbar({
          content,
          ...rest,
        });
      }
    );

    const unsubClear = customEventUtils.on(
      CustomEvents.common.clearSnackbar,
      () => {
        clearAll();
      }
    );

    return () => {
      unsubTrigger();
      unsubClear();
    };
  }, [triggerSnackbar, clearAll]);

  return <Snackbar snackbars={snackbars} onClose={removeSnackbar} />;
}
