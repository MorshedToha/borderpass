/**
 * src/app/how-it-works/page.tsx
 * How It Works — Step-by-step explanation of the platform
 */

import Link from "next/link";
import { ArrowRight, UserPlus, Globe2, Mic2, BarChart3, RefreshCw } from "lucide-react";

const STEPS = [
    {
        step: "01",
        icon: UserPlus,
        title: "Create Your Free Account",
        description: "Sign up in seconds with Google or email. No credit card needed. Your first live interview is completely free.",
        color: "text-brand-400",
        bg: "bg-brand-900/40 border-brand-800/50",
    },
    {
        step: "02",
        icon: Globe2,
        title: "Choose Your Country & Visa Type",
        description: "Select the country you're applying to — USA, Canada, or UK. Our AI is trained on real interview patterns for each country.",
        color: "text-visa-purple",
        bg: "bg-purple-900/30 border-purple-800/50",
    },
    {
        step: "03",
        icon: Mic2,
        title: "Speak With the AI Visa Officer",
        description: "Have a real-time voice conversation with our AI. It asks authentic questions just like a real visa officer would. Your speech is transcribed live so you can follow along.",
        color: "text-visa-green",
        bg: "bg-emerald-900/30 border-emerald-800/50",
    },
    {
        step: "04",
        icon: BarChart3,
        title: "Get Your Instant Score Report",
        description: "After the interview, receive a detailed breakdown: Financial Credibility, Study Intent, Return Intent, Confidence, and Consistency. Plus an overall risk level.",
        color: "text-yellow-400",
        bg: "bg-yellow-900/30 border-yellow-800/50",
    },
    {
        step: "05",
        icon: RefreshCw,
        title: "Practice Weak Areas & Improve",
        description: "Use Practice Mode to drill your weakest areas. Each session gets better. Track your progress in Analytics until you're ready for the real thing.",
        color: "text-red-400",
        bg: "bg-red-900/30 border-red-800/50",
    },
];

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-gray-950 text-white py-24 px-6">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-black mb-4">
                        How <span className="text-gradient">BOrderpass</span> Works
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Go from nervous applicant to confident interviewee in 5 simple steps
                    </p>
                </div>

                {/* Steps */}
                <div className="relative space-y-6">
                    {/* Connector line */}
                    <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gradient-to-b from-brand-800 via-gray-700 to-gray-900 hidden md:block" />

                    {STEPS.map((step, i) => (
                        <div key={i} className={`relative bg-gray-900 border ${step.bg.split(" ")[1]} rounded-2xl p-6 ml-0 md:ml-16`}>
                            {/* Step number dot */}
                            <div className={`hidden md:flex absolute -left-[3.25rem] top-6 w-8 h-8 rounded-full border-2 border-gray-700 bg-gray-900 items-center justify-center text-xs font-bold ${step.color}`}>
                                {i + 1}
                            </div>

                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-xl ${step.bg} border flex items-center justify-center flex-shrink-0`}>
                                    <step.icon className={`w-5 h-5 ${step.color}`} />
                                </div>
                                <div>
                                    <p className={`text-xs font-bold uppercase tracking-wider ${step.color} mb-1`}>
                                        Step {step.step}
                                    </p>
                                    <h2 className="text-lg font-bold text-white mb-2">{step.title}</h2>
                                    <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-16">
                    <Link
                        href="/signup"
                        className="gradient-brand inline-flex items-center gap-2 text-white font-bold text-lg px-8 py-4 rounded-2xl hover:opacity-90 transition-all hover:scale-105"
                    >
                        Start Your Free Interview <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
