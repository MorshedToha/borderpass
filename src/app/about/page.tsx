/**
 * src/app/about/page.tsx
 * About Page — Company mission, team, and values
 */

import Link from "next/link";
import { ArrowRight, Heart, Globe2, ShieldCheck, Zap } from "lucide-react";

const VALUES = [
    {
        icon: Globe2,
        title: "Borderless Opportunity",
        desc: "We believe where you're from should never limit where you can go. Education is a universal right.",
    },
    {
        icon: ShieldCheck,
        title: "Honest Preparation",
        desc: "We don't teach you to fake answers. We help you articulate your genuine story with clarity and confidence.",
    },
    {
        icon: Zap,
        title: "AI With Purpose",
        desc: "We use cutting-edge AI not for novelty, but to solve a real, painful problem for millions of students each year.",
    },
    {
        icon: Heart,
        title: "Student-First Always",
        desc: "Every design decision, pricing choice, and product update is made with the student's success in mind.",
    },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-950 text-white py-24 px-6">
            <div className="max-w-4xl mx-auto space-y-20">

                {/* Mission */}
                <div className="text-center">
                    <h1 className="text-5xl font-black mb-4">
                        We're on a Mission to <span className="text-gradient">Open Borders</span>
                    </h1>
                    <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
                        Every year, over 15 million student visa applications are filed worldwide. Millions are rejected — not because the students don't qualify, but because they couldn't articulate their story under pressure. BOrderpass exists to fix that.
                    </p>
                </div>

                {/* Story */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 md:p-12">
                    <h2 className="text-2xl font-bold text-white mb-5">Our Story</h2>
                    <div className="space-y-4 text-gray-400 leading-relaxed">
                        <p>
                            BOrderpass was founded in 2024 by a team of former international students who experienced the anxiety of visa interviews firsthand. One of our founders had their UK visa rejected twice before finally succeeding on the third attempt — not because anything changed in their profile, but because they learned to answer confidently.
                        </p>
                        <p>
                            We realized there was no good way to practice. Mock interviews with friends weren't realistic. Paid consultants were expensive and hard to schedule. YouTube videos couldn't give feedback. So we built the tool we wished we'd had.
                        </p>
                        <p>
                            Today, BOrderpass has helped over 50,000 students across 40+ countries practice and succeed in their visa interviews. We're a small, focused team driven by one goal: make sure no qualified student misses their opportunity because they were unprepared.
                        </p>
                    </div>
                </div>

                {/* Values */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">Our Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {VALUES.map((v) => (
                            <div key={v.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex gap-4">
                                <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center flex-shrink-0">
                                    <v.icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white mb-1">{v.title}</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">{v.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center gradient-brand rounded-2xl p-10">
                    <h2 className="text-2xl font-bold text-white mb-3">Join 50,000+ Students</h2>
                    <p className="text-blue-200 mb-6">Start your first free interview today — no credit card needed.</p>
                    <Link
                        href="/signup"
                        className="bg-white text-brand-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
                    >
                        Get Started Free <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
