export const DEFAULT_RESPONSIVE_STRAPI_IMAGE_SIZES = '100vw';

export const STRAPI_IMAGE_SIZES = {
  fullWidth: '100vw',
  articleBanner: '(max-width: 1024px) 100vw, 1024px',
  articleCard: '(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 400px',
  avatar: '64px',
} as const;
