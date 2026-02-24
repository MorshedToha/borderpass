/**
 * src/app/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Homepage — Public-facing landing page
 *  - Hero section with CTA
 *  - Stats bar
 *  - Feature highlights
 *  - Country cards
 *  - How it works
 *  - Testimonials
 *  - CTA section
 * ─────────────────────────────────────────────────────────────────────────────
 */

import Link from "next/link";
import {
    Mic2, Brain, BarChart3, Globe2, ShieldCheck,
    ArrowRight, Star, CheckCircle,
} from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
            {/* ── Navigation ───────────────────────────────────────────────────────── */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl font-black text-gradient">BOrderpass</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
                        <Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
                        <Link href="/countries" className="hover:text-white transition-colors">Countries</Link>
                        <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/login"
                            className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2"
                        >
                            Log in
                        </Link>
                        <Link
                            href="/signup"
                            className="gradient-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                        >
                            Start Free
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero ─────────────────────────────────────────────────────────────── */}
            <section className="relative gradient-hero pt-32 pb-20 px-6 text-center">
                {/* Background glow */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-600/20 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-brand-900/50 border border-brand-700/50 text-brand-300 text-sm px-4 py-2 rounded-full mb-8">
                        <span className="w-2 h-2 bg-visa-green rounded-full animate-pulse" />
                        Real-time AI Voice Interviewer — Practice Anytime
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
                        Nail Your Visa Interview<br />
                        <span className="text-gradient">With AI Practice</span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Talk to our AI visa officer. Get real-time voice feedback, instant scoring,
                        and know exactly where you need to improve — before the real interview.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/signup"
                            className="gradient-brand flex items-center gap-2 text-white font-bold text-lg px-8 py-4 rounded-2xl hover:opacity-90 transition-all hover:scale-105 shadow-xl shadow-brand-900/50"
                        >
                            Start Free Interview <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/how-it-works"
                            className="glass flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 transition-colors"
                        >
                            See How It Works
                        </Link>
                    </div>

                    <p className="text-sm text-gray-600 mt-6">No credit card required · 1 free interview</p>
                </div>
            </section>

            {/* ── Stats ─────────────────────────────────────────────────────────────── */}
            <section className="border-y border-gray-800 py-12 px-6">
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { value: "98%", label: "Student Satisfaction" },
                        { value: "50K+", label: "Interviews Conducted" },
                        { value: "3", label: "Countries Supported" },
                        { value: "4.9/5", label: "App Store Rating" },
                    ].map((stat) => (
                        <div key={stat.label}>
                            <p className="text-4xl font-black text-gradient">{stat.value}</p>
                            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Features ──────────────────────────────────────────────────────────── */}
            <section className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Everything You Need to Succeed
                        </h2>
                        <p className="text-gray-400 text-lg">
                            Our AI-powered platform gives you the full visa interview experience
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map((feature) => (
                            <div
                                key={feature.title}
                                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-brand-700 transition-colors group"
                            >
                                <div className="w-12 h-12 gradient-brand rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Countries ─────────────────────────────────────────────────────────── */}
            <section className="py-16 px-6 bg-gray-900/50">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">Prepare for Any Country</h2>
                    <p className="text-gray-400 mb-10">
                        Country-specific AI assistants trained on real visa interview patterns
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {COUNTRIES.map((c) => (
                            <Link
                                key={c.code}
                                href={`/countries/${c.code.toLowerCase()}`}
                                className="bg-gray-900 border border-gray-800 hover:border-brand-600 rounded-2xl p-8 text-center transition-all hover:scale-105 group"
                            >
                                <span className="text-6xl mb-4 block">{c.flag}</span>
                                <h3 className="text-xl font-bold text-white mb-1">{c.name}</h3>
                                <p className="text-sm text-gray-500">{c.visaType}</p>
                                <p className="mt-4 text-xs text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Practice Now →
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ───────────────────────────────────────────────────────────────── */}
            <section className="py-24 px-6 text-center">
                <div className="max-w-3xl mx-auto glass rounded-3xl p-12">
                    <h2 className="text-4xl font-black text-white mb-4">
                        Ready to Pass Your Visa Interview?
                    </h2>
                    <p className="text-gray-400 mb-8">
                        Join 50,000+ students who practiced with BOrderpass. Your first interview is free.
                    </p>
                    <Link
                        href="/signup"
                        className="gradient-brand inline-flex items-center gap-2 text-white font-bold text-lg px-10 py-4 rounded-2xl hover:opacity-90 transition-all hover:scale-105"
                    >
                        Start Free Today <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* ── Footer ────────────────────────────────────────────────────────────── */}
            <footer className="border-t border-gray-800 py-12 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-gray-500">
                    {FOOTER_LINKS.map((col) => (
                        <div key={col.heading}>
                            <h4 className="text-gray-300 font-semibold mb-4">{col.heading}</h4>
                            <ul className="space-y-2">
                                {col.links.map((l) => (
                                    <li key={l.label}>
                                        <Link href={l.href} className="hover:text-gray-300 transition-colors">
                                            {l.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-gray-800 text-center text-xs text-gray-600">
                    © {new Date().getFullYear()} BOrderpass AI Inc. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
    {
        icon: Mic2,
        title: "Real-Time Voice Interview",
        description: "Speak naturally with our AI visa officer. Your audio is streamed live for an authentic interview feel.",
    },
    {
        icon: Brain,
        title: "Instant AI Scoring",
        description: "Get scored on financial credibility, study intent, return intent, confidence, and consistency.",
    },
    {
        icon: BarChart3,
        title: "Detailed Analytics",
        description: "Track your progress across sessions. See exactly which areas improved and which need more work.",
    },
    {
        icon: Globe2,
        title: "Country-Specific Training",
        description: "Different countries have different officers. Our AI mimics real interview patterns for USA, Canada, and UK.",
    },
    {
        icon: ShieldCheck,
        title: "Risk Assessment",
        description: "Know your approval risk level — Low, Moderate, or High — based on your actual responses.",
    },
    {
        icon: Star,
        title: "Weak Area Retry",
        description: "Instantly re-practice any area where you scored low with targeted follow-up sessions.",
    },
];

const COUNTRIES = [
    { code: "USA", name: "United States", flag: "🇺🇸", visaType: "F1 / B1-B2 / J1 Visa" },
    { code: "CANADA", name: "Canada", flag: "🇨🇦", visaType: "Study / Visitor Permit" },
    { code: "UK", name: "United Kingdom", flag: "🇬🇧", visaType: "Student / Standard Visitor" },
];

const FOOTER_LINKS = [
    {
        heading: "Product",
        links: [
            { label: "How It Works", href: "/how-it-works" },
            { label: "Pricing", href: "/pricing" },
            { label: "Countries", href: "/countries" },
        ],
    },
    {
        heading: "Company",
        links: [
            { label: "About", href: "/about" },
            { label: "Blog", href: "/blog" },
            { label: "Contact", href: "/contact" },
        ],
    },
    {
        heading: "Legal",
        links: [
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
            { label: "Refund Policy", href: "/refund" },
        ],
    },
    {
        heading: "Support",
        links: [
            { label: "Help Center", href: "/help" },
            { label: "Discord", href: "/discord" },
            { label: "Status Page", href: "/status" },
        ],
    },
];
