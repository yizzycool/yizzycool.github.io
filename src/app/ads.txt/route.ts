export const dynamic = 'force-static';

const rawAdSenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || '';

const publisherId = rawAdSenseId.replace(/^ca-/, '');

export function GET() {
  const body = publisherId
    ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`
    : '# Set NEXT_PUBLIC_ADSENSE_CLIENT_ID in .env.production to publish your Google AdSense ads.txt entry.\n';

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
