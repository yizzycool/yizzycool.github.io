import type { ReactNode } from 'react';
import type { AnimatePresenceProps } from 'motion/react';

export type PresenceProps = {
  /** Controls visibility and triggers enter/exit animations */
  isOpen: boolean;
  /** Whether to unmount children from the DOM when hidden. Defaults to true. */
  unmount?: boolean;
  /** AnimatePresence mode: 'sync' | 'wait' | 'popLayout'. Defaults to 'sync'. */
  mode?: AnimatePresenceProps['mode'];
  /** Whether to animate on initial mount. Defaults to false. */
  initial?: boolean;
  /** Callback fired after all exit animations have completed */
  onExitComplete?: () => void;
  /** Content to render */
  children: ReactNode;
};
