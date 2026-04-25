import { http, HttpResponse, type HttpHandler } from "msw";

/**
 * Canonical Stripe API mock factory.
 *
 * Provides (a) typed fixture builders for common Stripe objects and
 * (b) MSW handlers that serve those fixtures against the real Stripe REST
 * endpoints. Tests that touch a Stripe-calling path can compose these
 * handlers into their own `setupServer(...)` without re-writing the HTTP
 * surface per-test.
 *
 * Why this lives under `src/tests/factories/external/`:
 *   - `factories/` is the canonical fixture namespace for all tests.
 *   - `external/` segregates third-party-API mocks from domain fixtures
 *     (Prisma model factories etc.). A test that fails here is a mock
 *     drift issue, not an app-logic issue.
 *
 * The handlers in `stripeHandlers()` return deterministic shapes — never
 * wire these into a production build, and never call a live Stripe key
 * inside a test that has these handlers active. The whole point is to
 * keep the test suite hermetic and fast.
 */

export type MakePaymentIntentOptions = {
  id?: string;
  amount?: number;
  currency?: string;
  status?: "requires_payment_method" | "requires_confirmation" | "succeeded" | "canceled";
  customerId?: string;
  metadata?: Record<string, string>;
};

export function makePaymentIntent(options: MakePaymentIntentOptions = {}) {
  const id = options.id ?? "pi_test_canonical";
  return {
    id,
    object: "payment_intent" as const,
    amount: options.amount ?? 1000,
    currency: options.currency ?? "jpy",
    status: options.status ?? "succeeded",
    customer: options.customerId ?? null,
    metadata: options.metadata ?? {},
    client_secret: `${id}_secret_canonical`,
    created: Math.floor(Date.now() / 1000),
  };
}

export type MakeCheckoutSessionOptions = {
  id?: string;
  customerId?: string;
  subscriptionId?: string;
  metadata?: Record<string, string>;
};

export function makeCheckoutSession(options: MakeCheckoutSessionOptions = {}) {
  const id = options.id ?? "cs_test_canonical";
  return {
    id,
    object: "checkout.session" as const,
    customer: options.customerId ?? "cus_test_canonical",
    subscription: options.subscriptionId ?? null,
    payment_status: "paid" as const,
    status: "complete" as const,
    mode: "payment" as const,
    metadata: options.metadata ?? {},
    url: `https://checkout.stripe.com/c/pay/${id}`,
  };
}

export type MakeCustomerOptions = {
  id?: string;
  email?: string;
  name?: string;
};

export function makeCustomer(options: MakeCustomerOptions = {}) {
  return {
    id: options.id ?? "cus_test_canonical",
    object: "customer" as const,
    email: options.email ?? "test@example.com",
    name: options.name ?? "Test Customer",
    created: Math.floor(Date.now() / 1000),
  };
}

/**
 * MSW handler bundle covering the five Stripe REST endpoints most
 * commonly hit from this fleet (payment_intents + checkout.sessions +
 * customers + subscriptions, create/retrieve pair). Compose with a
 * `setupServer(...)` instance in your test setup. Override per-test by
 * passing additional handlers to `.use(...)`.
 *
 * Webhook signature verification is NOT mocked here — that's covered by
 * `scripts/lint-stripe-webhook.mjs` and the contract test helpers in
 * `src/tests/helpers/stripe-webhook.ts`, which use Stripe's own HMAC.
 */
export function stripeHandlers(): HttpHandler[] {
  return [
    http.post("https://api.stripe.com/v1/payment_intents", async () =>
      HttpResponse.json(makePaymentIntent()),
    ),
    http.get("https://api.stripe.com/v1/payment_intents/:id", ({ params }) =>
      HttpResponse.json(makePaymentIntent({ id: String(params.id) })),
    ),
    http.post("https://api.stripe.com/v1/checkout/sessions", async () =>
      HttpResponse.json(makeCheckoutSession()),
    ),
    http.get("https://api.stripe.com/v1/checkout/sessions/:id", ({ params }) =>
      HttpResponse.json(makeCheckoutSession({ id: String(params.id) })),
    ),
    http.post("https://api.stripe.com/v1/customers", async () =>
      HttpResponse.json(makeCustomer()),
    ),
  ];
}
