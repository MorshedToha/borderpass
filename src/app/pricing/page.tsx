/**
 * src/app/pricing/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Pricing Page — Free / Pro / Premium tier cards with Stripe checkout
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, Zap, Crown, Gift } from "lucide-react";

type BillingCycle = "monthly" | "yearly";

interface Plan {
    key: string;
    name: string;
    icon: React.ElementType;
    monthlyPrice: number;
    yearlyPrice: number;
    description: string;
    features: string[];
    cta: string;
    highlighted: boolean;
    badge?: string;
}

const PLANS: Plan[] = [
    {
        key: "FREE",
        name: "Free",
        icon: Gift,
        monthlyPrice: 0,
        yearlyPrice: 0,
        description: "Perfect to get started and see how it works",
        features: [
            "1 live interview session",
            "Text-only simulation",
            "Basic scoring report",
            "3 countries available",
        ],
        cta: "Start Free",
        highlighted: false,
    },
    {
        key: "PRO",
        name: "Pro",
        icon: Zap,
        monthlyPrice: 29,
        yearlyPrice: 19,
        description: "For serious students preparing actively",
        badge: "Most Popular",
        features: [
            "10 live interview sessions",
            "🎤 Full voice mode with AI",
            "Detailed scoring breakdown",
            "Weak area retry sessions",
            "Progress analytics",
            "All 3 countries",
        ],
        cta: "Upgrade to Pro",
        highlighted: true,
    },
    {
        key: "PREMIUM",
        name: "Premium",
        icon: Crown,
        monthlyPrice: 79,
        yearlyPrice: 49,
        description: "For maximum preparation with no limits",
        features: [
            "Unlimited live interviews",
            "🎤 Full voice mode with AI",
            "Advanced analytics dashboard",
            "Confidence tracking over time",
            "Priority email support",
            "All countries (+ upcoming)",
            "Early access to new features",
        ],
        cta: "Upgrade to Premium",
        highlighted: false,
    },
];

export default function PricingPage() {
    const [billing, setBilling] = useState<BillingCycle>("monthly");

    const handleCheckout = async (planKey: string) => {
        if (planKey === "FREE") {
            window.location.href = "/signup";
            return;
        }

        const res = await fetch("/api/stripe/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan: planKey, billing }),
        });

        const { url } = await res.json();
        if (url) window.location.href = url;
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white py-24 px-6">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-black mb-4">
                        Simple, <span className="text-gradient">Transparent</span> Pricing
                    </h1>
                    <p className="text-xl text-gray-400 mb-8">
                        Choose the plan that fits your visa preparation goals
                    </p>

                    {/* Billing toggle */}
                    <div className="inline-flex items-center bg-gray-900 border border-gray-800 rounded-xl p-1">
                        <button
                            onClick={() => setBilling("monthly")}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${billing === "monthly"
                                    ? "bg-brand-600 text-white"
                                    : "text-gray-400 hover:text-white"
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBilling("yearly")}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${billing === "yearly"
                                    ? "bg-brand-600 text-white"
                                    : "text-gray-400 hover:text-white"
                                }`}
                        >
                            Yearly
                            <span className="bg-visa-green/20 text-visa-green text-xs px-2 py-0.5 rounded-full">
                                Save 35%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Plan Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PLANS.map((plan) => {
                        const price = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

                        return (
                            <div
                                key={plan.key}
                                className={`relative rounded-2xl p-8 border transition-all ${plan.highlighted
                                        ? "border-brand-500 bg-gradient-to-b from-brand-950/50 to-gray-900 scale-105 shadow-2xl shadow-brand-900/30"
                                        : "border-gray-800 bg-gray-900 hover:border-gray-700"
                                    }`}
                            >
                                {plan.badge && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="gradient-brand text-white text-xs font-bold px-4 py-1.5 rounded-full">
                                            {plan.badge}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.highlighted ? "gradient-brand" : "bg-gray-800"
                                        }`}>
                                        <plan.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold">{plan.name}</h2>
                                </div>

                                <p className="text-sm text-gray-400 mb-6">{plan.description}</p>

                                <div className="mb-8">
                                    <span className="text-5xl font-black">${price}</span>
                                    {price > 0 && (
                                        <span className="text-gray-500 ml-1 text-sm">/ {billing === "monthly" ? "mo" : "mo, billed yearly"}</span>
                                    )}
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle className="w-4 h-4 text-visa-green flex-shrink-0 mt-0.5" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleCheckout(plan.key)}
                                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${plan.highlighted
                                            ? "gradient-brand text-white hover:opacity-90"
                                            : "bg-gray-800 hover:bg-gray-700 text-white"
                                        }`}
                                >
                                    {plan.cta}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Trust badges */}
                <div className="mt-16 text-center text-sm text-gray-600 flex flex-wrap justify-center gap-6">
                    <span>🔒 Secure payments via Stripe</span>
                    <span>🔄 Cancel anytime</span>
                    <span>💰 7-day money back guarantee</span>
                    <span>🌍 Global availability</span>
                </div>
            </div>
        </div>
    );
}
