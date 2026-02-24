/**
 * src/services/stripe.service.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Stripe Integration Service
 *
 * Responsibilities:
 *  - Create/retrieve Stripe customers
 *  - Create checkout sessions
 *  - Handle subscription management (cancel, upgrade, downgrade)
 *  - Process webhook events
 *  - Map Stripe plans to app subscription plans
 * ─────────────────────────────────────────────────────────────────────────────
 */

import Stripe from "stripe";

// ─── Stripe Client ────────────────────────────────────────────────────────────

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2024-06-20",
    typescript: true,
});

// ─── Plan Configuration ───────────────────────────────────────────────────────

export const PLAN_CONFIG = {
    FREE: {
        name: "Free",
        price: 0,
        interviewLimit: 1,
        voiceMode: false,
        features: ["1 live interview", "Text-only simulation", "Basic scoring"],
    },
    PRO: {
        name: "Pro",
        price: 29,
        interviewLimit: 10,
        voiceMode: true,
        monthlyPriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? "",
        yearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? "",
        features: [
            "10 live interviews",
            "Voice mode",
            "Detailed scoring",
            "Weak area retry",
        ],
    },
    PREMIUM: {
        name: "Premium",
        price: 79,
        interviewLimit: -1, // unlimited
        voiceMode: true,
        monthlyPriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID ?? "",
        yearlyPriceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID ?? "",
        features: [
            "Unlimited live interviews",
            "Advanced analytics",
            "Confidence tracking",
            "Priority support",
        ],
    },
} as const;

export type PlanKey = keyof typeof PLAN_CONFIG;

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Create or retrieve a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(
    userId: string,
    email: string,
    name?: string
): Promise<string> {
    // Check if customer already exists (look up by metadata)
    const existing = await stripe.customers.search({
        query: `metadata['userId']:'${userId}'`,
        limit: 1,
    });

    if (existing.data.length > 0) {
        return existing.data[0].id;
    }

    const customer = await stripe.customers.create({
        email,
        name: name ?? undefined,
        metadata: { userId },
    });

    return customer.id;
}

/**
 * Create a Stripe Checkout Session for subscription upgrade
 */
export async function createCheckoutSession({
    userId,
    email,
    priceId,
    plan,
    successUrl,
    cancelUrl,
}: {
    userId: string;
    email: string;
    priceId: string;
    plan: PlanKey;
    successUrl: string;
    cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
    const customerId = await getOrCreateStripeCustomer(userId, email);

    return stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata: { userId, plan },
        subscription_data: {
            metadata: { userId, plan },
        },
        allow_promotion_codes: true,
    });
}

/**
 * Create a Stripe Billing Portal session for subscription management
 */
export async function createBillingPortalSession(
    customerId: string,
    returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
    return stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });
}

/**
 * Retrieve a subscription from Stripe
 */
export async function getSubscription(
    subscriptionId: string
): Promise<Stripe.Subscription> {
    return stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Map Stripe plan metadata back to app PlanKey
 */
export function mapStripePlan(metadata: Stripe.Metadata): PlanKey {
    const plan = metadata.plan?.toUpperCase();
    if (plan === "PRO") return "PRO";
    if (plan === "PREMIUM") return "PREMIUM";
    return "FREE";
}

/**
 * Get interview limit for a given plan
 */
export function getInterviewLimit(plan: PlanKey): number {
    return PLAN_CONFIG[plan].interviewLimit;
}

/**
 * Check if a plan supports voice mode
 */
export function supportsVoiceMode(plan: PlanKey): boolean {
    return PLAN_CONFIG[plan].voiceMode;
}
