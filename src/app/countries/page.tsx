/**
 * src/app/countries/page.tsx
 * Countries listing — links to individual country detail pages
 */

import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

const COUNTRIES = [
    {
        code: "usa",
        name: "United States",
        flag: "🇺🇸",
        visaTypes: ["F-1 Student Visa", "B-1/B-2 Visitor Visa", "J-1 Exchange Visitor"],
        tips: ["Demonstrate strong ties to home country", "Show clear financial proof", "Be specific about your study plan"],
        color: "from-blue-900/40 to-gray-900",
    },
    {
        code: "canada",
        name: "Canada",
        flag: "🇨🇦",
        visaTypes: ["Study Permit", "Visitor Visa / eTA", "Work Permit"],
        tips: ["Show letter of acceptance", "Prove financial sufficiency", "Demonstrate intent to leave after studies"],
        color: "from-red-900/30 to-gray-900",
    },
    {
        code: "uk",
        name: "United Kingdom",
        flag: "🇬🇧",
        visaTypes: ["Student Visa (Tier 4)", "Standard Visitor Visa", "Graduate Route"],
        tips: ["Have CAS number ready", "Show bank statements (28+ days)", "Demonstrate English proficiency"],
        color: "from-indigo-900/40 to-gray-900",
    },
];

export default function CountriesPage() {
    return (
        <div className="min-h-screen bg-gray-950 text-white py-24 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-black mb-4">
                        Prepare for <span className="text-gradient">Any Country</span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Country-specific AI interviewers trained on real visa officer patterns
                    </p>
                </div>

                <div className="space-y-6">
                    {COUNTRIES.map((country) => (
                        <div
                            key={country.code}
                            className={`bg-gradient-to-r ${country.color} border border-gray-800 rounded-2xl p-8`}
                        >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <span className="text-6xl">{country.flag}</span>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{country.name}</h2>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {country.visaTypes.map((v) => (
                                                <span key={v} className="text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full">
                                                    {v}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    href={`/dashboard/start?country=${country.code.toUpperCase()}`}
                                    className="gradient-brand flex items-center gap-2 text-white font-semibold text-sm px-5 py-3 rounded-xl hover:opacity-90 flex-shrink-0"
                                >
                                    Practice Now <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="mt-6 pt-5 border-t border-gray-800/50">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Key Tips</p>
                                <ul className="space-y-2">
                                    {country.tips.map((tip) => (
                                        <li key={tip} className="flex items-center gap-2 text-sm text-gray-300">
                                            <CheckCircle className="w-4 h-4 text-visa-green flex-shrink-0" />
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
