/**
 * Device layout type for the search trigger button and modal sizing.
 */
export type SearchDeviceType = 'desktop' | 'mobile';

/**
 * Props for the global SearchDialog component.
 */
export type SearchDialogProps = {
  /** Target device viewport layout */
  deviceType: SearchDeviceType;
};
