/**
 * Stripe checkout stub — Phase 1 placeholder.
 * Wire Checkout / PaymentIntents when ready; do not put secret keys in the client.
 */
export type StripeCheckoutStubInput = {
  gameId: string
  slug: string
  priceCents: number
  currency: string
  title: string
}

export type StripeCheckoutStubResult = {
  ok: false
  reason: 'not_implemented'
  message: string
}

export async function createCheckoutSession(
  _input: StripeCheckoutStubInput,
): Promise<StripeCheckoutStubResult> {
  return {
    ok: false,
    reason: 'not_implemented',
    message:
      'Stripe checkout is not wired yet. Configure a server-side Stripe secret and Checkout Session endpoint in a later phase.',
  }
}

export const stripeClientStub = {
  enabled: false as const,
  createCheckoutSession,
}
