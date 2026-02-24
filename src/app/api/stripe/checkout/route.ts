/**
 * src/app/api/stripe/checkout/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout Session and returns the redirect URL
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
    createCheckoutSession,
    PLAN_CONFIG,
    type PlanKey,
} from "@/services/stripe.service";
import { z } from "zod";

const schema = z.object({
    plan: z.enum(["PRO", "PREMIUM"]),
    billing: z.enum(["monthly", "yearly"]).default("monthly"),
});

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { plan, billing } = parsed.data;
    const planConfig = PLAN_CONFIG[plan as PlanKey] as {
        monthlyPriceId?: string;
        yearlyPriceId?: string;
    };

    const priceId = billing === "yearly"
        ? planConfig.yearlyPriceId
        : planConfig.monthlyPriceId;

    if (!priceId) {
        return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const checkoutSession = await createCheckoutSession({
        userId: session.user.id,
        email: session.user.email ?? "",
        priceId,
        plan: plan as PlanKey,
        successUrl: `${baseUrl}/dashboard?upgraded=true`,
        cancelUrl: `${baseUrl}/pricing`,
    });

    return NextResponse.json({ url: checkoutSession.url });
}
