/**
 * src/app/api/stripe/webhook/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Stripe Webhook Handler
 *
 * Handles subscription lifecycle events and syncs to the database:
 *  - checkout.session.completed    → provision access
 *  - customer.subscription.updated → change plan
 *  - customer.subscription.deleted → downgrade to FREE
 *  - invoice.payment_failed        → mark as past_due
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe, mapStripePlan, getInterviewLimit } from "@/services/stripe.service";

// Tell Next.js not to parse body (Stripe needs raw bytes for signature check)
export const config = { api: { bodyParser: false } };

// ─── Webhook Handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    const rawBody = await req.text();
    const sig = req.headers.get("stripe-signature") ?? "";

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET ?? ""
        );
    } catch (err) {
        console.error("[Webhook] Signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // ── Handle Events ─────────────────────────────────────────────────────────

    try {
        switch (event.type) {
            // ── Checkout completed (new sub or upgrade) ───────────────────────────
            case "checkout.session.completed": {
                const checkoutSession = event.data.object as Stripe.Checkout.Session;
                const userId = checkoutSession.metadata?.userId;
                const plan = checkoutSession.metadata?.plan;
                const subscriptionId = checkoutSession.subscription as string;
                const customerId = checkoutSession.customer as string;

                if (!userId || !plan) break;

                const planKey = plan.toUpperCase() as "PRO" | "PREMIUM";
                const limit = getInterviewLimit(planKey);

                await prisma.subscription.upsert({
                    where: { userId },
                    create: {
                        userId,
                        plan: planKey,
                        status: "ACTIVE",
                        stripeCustomerId: customerId,
                        stripeSubscriptionId: subscriptionId,
                        interviewsLimit: limit,
                        interviewsUsed: 0,
                    },
                    update: {
                        plan: planKey,
                        status: "ACTIVE",
                        stripeCustomerId: customerId,
                        stripeSubscriptionId: subscriptionId,
                        interviewsLimit: limit,
                    },
                });

                console.log(`[Webhook] Provisioned ${planKey} for userId=${userId}`);
                break;
            }

            // ── Subscription updated (billing cycle, upgrade, downgrade) ──────────
            case "customer.subscription.updated": {
                const sub = event.data.object as Stripe.Subscription;
                const userId = sub.metadata?.userId;
                if (!userId) break;

                const planKey = mapStripePlan(sub.metadata);
                const limit = getInterviewLimit(planKey);

                await prisma.subscription.update({
                    where: { userId },
                    data: {
                        plan: planKey,
                        status: sub.status.toUpperCase() as any,
                        stripePriceId: sub.items.data[0]?.price.id,
                        stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
                        interviewsLimit: limit,
                    },
                });

                console.log(`[Webhook] Updated subscription for userId=${userId} → ${planKey}`);
                break;
            }

            // ── Subscription canceled ────────────────────────────────────────────
            case "customer.subscription.deleted": {
                const sub = event.data.object as Stripe.Subscription;
                const userId = sub.metadata?.userId;
                if (!userId) break;

                await prisma.subscription.update({
                    where: { userId },
                    data: {
                        plan: "FREE",
                        status: "CANCELED",
                        interviewsLimit: 1,
                    },
                });

                console.log(`[Webhook] Downgraded to FREE for userId=${userId}`);
                break;
            }

            // ── Payment failed ────────────────────────────────────────────────────
            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;
                const customerId = invoice.customer as string;

                await prisma.subscription.updateMany({
                    where: { stripeCustomerId: customerId },
                    data: { status: "PAST_DUE" },
                });

                console.log(`[Webhook] Payment failed for customerId=${customerId}`);
                break;
            }

            default:
                break;
        }
    } catch (err) {
        console.error("[Webhook] Handler error:", err);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
