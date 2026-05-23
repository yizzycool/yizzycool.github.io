import cctvData from '@/data/tools/everyday-life-tool/taiwan-live-cams/cctv';

export const dynamic = 'force-static';

export async function GET() {
  return Response.json(cctvData);
}
