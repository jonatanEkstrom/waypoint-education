'use client'
import { useSyncExternalStore } from 'react'

/**
 * Launch offer: from this moment, new customers get 50% off their first billing
 * period (any plan) instead of the 10-day free trial. Runs until removed.
 * Keep in sync with OFFER_START in app/lib/server/offer.ts.
 */
export const OFFER_START_ISO = '2026-12-01T00:00:00+01:00'

export function isOfferLive(now: Date = new Date()): boolean {
  return now >= new Date(OFFER_START_ISO)
}

/**
 * Client hook. Uses the server snapshot (false) for prerender and hydration, so
 * the HTML matches, then the real client time. Redeploy on launch day so the
 * prerendered HTML also carries the new copy.
 */
const noopSubscribe = () => () => {}
export function useOfferLive(): boolean {
  return useSyncExternalStore(noopSubscribe, () => isOfferLive(), () => false)
}

export function halfPrice(price: number): string {
  const v = price / 2
  return Number.isInteger(v) ? String(v) : v.toFixed(2)
}

export const OFFER_TAGLINE = 'First billing period 50% off · Cancel anytime'
export const TRIAL_TAGLINE = '10 days free · No card required'
