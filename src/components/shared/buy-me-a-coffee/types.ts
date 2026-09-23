export type BuyMeACoffeeColor = 'yellow' | 'violet' | 'blue' | 'green' | 'red';

/**
 * Props for the BuyMeACoffee donation widget.
 */
export type BuyMeACoffeeProps = {
  /** Color theme for the coffee button (default: 'yellow') */
  color?: BuyMeACoffeeColor;
  /** Additional CSS class names for the anchor link */
  linkClassName?: string;
  /** Additional CSS class names for the coffee button image */
  imageClassName?: string;
};
