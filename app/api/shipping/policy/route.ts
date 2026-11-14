import { NextResponse } from 'next/server';
import { getCheckoutPolicy } from '@/lib/erp-checkout-policy';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = await getCheckoutPolicy();
  return NextResponse.json(
    { minimumCents: config.available ? config.freeShippingMinimumCents : null },
    { status: config.available ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  );
}
