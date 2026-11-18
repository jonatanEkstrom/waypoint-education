import Stripe from 'stripe'

/** Same moment as OFFER_START_ISO in app/lib/offer.ts. */
export const OFFER_START = new Date('2026-12-01T00:00:00+01:00')

export function isOfferLive(now: Date = new Date()): boolean {
  return now >= OFFER_START
}

/** Fixed id so the coupon is created once and reused. */
export const FIRST_PERIOD_COUPON_ID = 'WAYPOINT_FIRST_PERIOD_50'

/**
 * Returns the 50%-off-first-invoice coupon, creating it in Stripe if it does
 * not exist yet. duration 'once' = applies to the first invoice only, so the
 * customer pays full price from the second billing period.
 */
export async function ensureFirstPeriodCoupon(stripe: Stripe): Promise<string> {
  try {
    const c = await stripe.coupons.retrieve(FIRST_PERIOD_COUPON_ID)
    if (c.valid) return c.id
    throw new Error(`Coupon ${FIRST_PERIOD_COUPON_ID} exists but is not valid`)
  } catch (e: any) {
    if (e?.code !== 'resource_missing') throw e
  }
  const created = await stripe.coupons.create({
    id: FIRST_PERIOD_COUPON_ID,
    name: 'First period 50% off',
    percent_off: 50,
    duration: 'once',
  })
  return created.id
}
