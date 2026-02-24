/**
 * src/app/(dashboard)/dashboard/start/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Start Simulation Page — Country selector + mode selector → launches /live
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Mic2, FileText, ArrowRight, Loader2, Lock, CheckCircle,
} from "lucide-react";

type Country = {
    id: string;
    name: string;
    code: string;
    flag: string;
    description: string;
};

type Mode = "VOICE" | "TEXT";

export default function StartSimulationPage() {
    const router = useRouter();

    const [countries, setCountries] = useState<Country[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedMode, setSelectedMode] = useState<Mode>("VOICE");
    const [isPro, setIsPro] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);

    // Load countries + subscription status
    useEffect(() => {
        Promise.all([
            fetch("/api/countries").then((r) => r.json()),
            fetch("/api/user/subscription").then((r) => r.json()),
        ]).then(([countriesData, subData]) => {
            setCountries(countriesData.countries ?? []);
            setIsPro(subData.plan === "PRO" || subData.plan === "PREMIUM");
            setFetchingData(false);
        });
    }, []);

    const handleStart = async () => {
        if (!selectedCountry) return;
        setLoading(true);

        const res = await fetch("/api/interview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ countryId: selectedCountry, mode: selectedMode }),
        });
        const data = await res.json();

        if (!res.ok) {
            if (data.upgradeRequired) {
                router.push("/pricing?reason=limit");
                return;
            }
            alert(data.error ?? "Failed to start session");
            setLoading(false);
            return;
        }

        const { session } = data;
        const country = countries.find((c) => c.id === selectedCountry);

        // Redirect to live interview
        router.push(
            `/live?sessionId=${session.id}&country=${country?.code ?? "USA"}&userId=${session.userId}`
        );
    };

    if (fetchingData) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-3xl mx-auto space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Start Interview Simulation</h1>
                <p className="text-gray-400 mt-1">Choose a country and your preferred practice mode</p>
            </div>

            {/* Step 1 — Country */}
            <section className="space-y-4">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full gradient-brand flex items-center justify-center text-xs text-white">1</span>
                    Select Country
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {countries.map((country) => (
                        <motion.button
                            key={country.id}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setSelectedCountry(country.id)}
                            className={`relative p-6 rounded-2xl border text-left transition-all ${selectedCountry === country.id
                                    ? "border-brand-500 bg-brand-950/40 ring-1 ring-brand-500"
                                    : "border-gray-800 bg-gray-900 hover:border-gray-700"
                                }`}
                        >
                            {selectedCountry === country.id && (
                                <CheckCircle className="absolute top-3 right-3 w-4 h-4 text-brand-400" />
                            )}
                            <span className="text-4xl mb-3 block">{country.flag}</span>
                            <p className="text-sm font-bold text-white">{country.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{country.description}</p>
                        </motion.button>
                    ))}
                </div>
            </section>

            {/* Step 2 — Mode */}
            <section className="space-y-4">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full gradient-brand flex items-center justify-center text-xs text-white">2</span>
                    Select Practice Mode
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Voice Mode */}
                    <button
                        onClick={() => isPro && setSelectedMode("VOICE")}
                        className={`relative p-6 rounded-2xl border text-left transition-all ${!isPro
                                ? "border-gray-800 bg-gray-900/40 opacity-60 cursor-not-allowed"
                                : selectedMode === "VOICE"
                                    ? "border-brand-500 bg-brand-950/40 ring-1 ring-brand-500"
                                    : "border-gray-800 bg-gray-900 hover:border-gray-700"
                            }`}
                    >
                        {!isPro && (
                            <div className="absolute top-3 right-3 flex items-center gap-1 bg-yellow-500/20 border border-yellow-500/30 px-2 py-0.5 rounded-full">
                                <Lock className="w-3 h-3 text-yellow-400" />
                                <span className="text-xs text-yellow-400">Pro</span>
                            </div>
                        )}
                        {selectedMode === "VOICE" && isPro && (
                            <CheckCircle className="absolute top-3 right-3 w-4 h-4 text-brand-400" />
                        )}
                        <Mic2 className="w-8 h-8 text-brand-400 mb-3" />
                        <p className="text-sm font-bold text-white">Voice Mode</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Speak with the AI visa officer live. Closest to the real experience.
                        </p>
                    </button>

                    {/* Text Mode */}
                    <button
                        onClick={() => setSelectedMode("TEXT")}
                        className={`relative p-6 rounded-2xl border text-left transition-all ${selectedMode === "TEXT"
                                ? "border-brand-500 bg-brand-950/40 ring-1 ring-brand-500"
                                : "border-gray-800 bg-gray-900 hover:border-gray-700"
                            }`}
                    >
                        {selectedMode === "TEXT" && (
                            <CheckCircle className="absolute top-3 right-3 w-4 h-4 text-brand-400" />
                        )}
                        <FileText className="w-8 h-8 text-gray-400 mb-3" />
                        <p className="text-sm font-bold text-white">Text Mode</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Type your answers. Great for first-timers. Available on the Free plan.
                        </p>
                    </button>
                </div>

                {/* Upgrade nudge */}
                {!isPro && selectedMode === "VOICE" && (
                    <div className="flex items-center gap-3 bg-yellow-950/30 border border-yellow-900/40 rounded-xl p-4">
                        <Lock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                        <p className="text-sm text-yellow-300">
                            Voice mode requires a Pro or Premium plan.{" "}
                            <a href="/pricing" className="underline font-semibold hover:text-yellow-200">
                                Upgrade now →
                            </a>
                        </p>
                    </div>
                )}
            </section>

            {/* Start Button */}
            <motion.button
                onClick={handleStart}
                disabled={!selectedCountry || loading}
                whileHover={{ scale: selectedCountry ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full gradient-brand text-white font-bold text-lg py-4 rounded-2xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-900/30"
            >
                {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Setting up your session…</>
                ) : (
                    <>Start Interview <ArrowRight className="w-5 h-5" /></>
                )}
            </motion.button>

            {!selectedCountry && (
                <p className="text-center text-xs text-gray-600">Please select a country to continue</p>
            )}
        </div>
    );
}
