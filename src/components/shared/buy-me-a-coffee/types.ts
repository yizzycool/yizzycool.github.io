export type BuyMeACoffeeVariant = 'compact' | 'card';

/**
 * Props for the BuyMeACoffee support widget.
 */
export type BuyMeACoffeeProps = {
  /** Presentation variant: compact pill row for sidebars or rich support card for mobile drawer */
  variant?: BuyMeACoffeeVariant;
  /** Primary heading text */
  title?: string;
  /** Secondary helper copy shown in the 'card' variant */
  subtitle?: string;
  /** Additional CSS class names for the anchor link */
  className?: string;
};
