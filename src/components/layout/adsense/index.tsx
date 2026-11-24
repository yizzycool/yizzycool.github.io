const rawAdSenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || '';

const adsenseClientId = rawAdSenseId
  ? rawAdSenseId.startsWith('ca-')
    ? rawAdSenseId
    : `ca-${rawAdSenseId}`
  : '';

/**
 * Renders Google AdSense verification `<meta>` and global loader `<script>` in `<head>`
 * when `NEXT_PUBLIC_ADSENSE_CLIENT_ID` is configured.
 */
export function AdSenseScript() {
  if (!adsenseClientId) return null;

  return (
    <>
      <meta name="google-adsense-account" content={adsenseClientId} />
      <script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
        crossOrigin="anonymous"
      />
    </>
  );
}
