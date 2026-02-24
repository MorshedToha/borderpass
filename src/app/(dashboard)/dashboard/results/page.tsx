/**
 * src/app/(dashboard)/dashboard/results/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Post-Interview Results & Score Breakdown Page
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    TrendingUp, ShieldAlert, ShieldCheck, ShieldQuestion,
    ChevronRight, RefreshCw, BarChart2,
} from "lucide-react";
import {
    RadarChart, PolarGrid, PolarAngleAxis, Radar,
    ResponsiveContainer, Tooltip,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Score {
    overallScore: number;
    riskLevel: "LOW" | "MODERATE" | "HIGH";
    financialCredibility: number;
    studyIntent: number;
    returnIntent: number;
    confidenceScore: number;
    consistencyScore: number;
    weakAreas: string[];
    feedback: string;
}

const WEAK_AREA_LABELS: Record<string, string> = {
    financial_credibility: "Financial Credibility",
    study_intent: "Study Intent",
    return_intent: "Return Intent",
    confidence: "Confidence & Fluency",
    consistency: "Answer Consistency",
};

// ─────────────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get("sessionId");

    const [score, setScore] = useState<Score | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) return;

        (async () => {
            try {
                const res = await fetch(`/api/interview/${sessionId}/score`, { method: "POST" });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error ?? "Failed to load score");
                setScore(data.score as Score);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        })();
    }, [sessionId]);

    if (loading) return <LoadingState />;
    if (error || !score) return <ErrorState message={error} />;

    // ── Radar chart data ───────────────────────────────────────────────────────
    const radarData = [
        { subject: "Financial", score: score.financialCredibility },
        { subject: "Study Intent", score: score.studyIntent },
        { subject: "Return Intent", score: score.returnIntent },
        { subject: "Confidence", score: score.confidenceScore },
        { subject: "Consistency", score: score.consistencyScore },
    ];

    const RiskIcon =
        score.riskLevel === "LOW" ? ShieldCheck :
            score.riskLevel === "MODERATE" ? ShieldQuestion :
                ShieldAlert;

    const riskColor =
        score.riskLevel === "LOW" ? "text-visa-green" :
            score.riskLevel === "MODERATE" ? "text-yellow-400" :
                "text-red-400";

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <h1 className="text-4xl font-bold text-white mb-2">Interview Results</h1>
                    <p className="text-gray-400">Your AI-powered visa interview analysis</p>
                </motion.div>

                {/* Overall Score + Risk */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {/* Score donut */}
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 flex flex-col items-center gap-4">
                        <p className="text-sm text-gray-400 uppercase tracking-wider">Overall Score</p>
                        <div className="relative w-40 h-40">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#1f2937" strokeWidth="12" />
                                <motion.circle
                                    cx="50" cy="50" r="40"
                                    fill="none"
                                    stroke={score.overallScore >= 70 ? "#10b981" : score.overallScore >= 45 ? "#f59e0b" : "#ef4444"}
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 40}`}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - score.overallScore / 100) }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-white">{score.overallScore}</span>
                                <span className="text-sm text-gray-400">/ 100</span>
                            </div>
                        </div>
                        <p className="text-gray-300">{score.feedback}</p>
                    </div>

                    {/* Risk level */}
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 flex flex-col items-center justify-center gap-4">
                        <p className="text-sm text-gray-400 uppercase tracking-wider">Risk Assessment</p>
                        <RiskIcon className={`w-20 h-20 ${riskColor}`} />
                        <p className={`text-3xl font-bold ${riskColor}`}>{score.riskLevel} RISK</p>
                        <p className="text-gray-400 text-sm text-center">
                            {score.riskLevel === "LOW"
                                ? "Strong approval potential. Keep it up!"
                                : score.riskLevel === "MODERATE"
                                    ? "Some areas need improvement before your interview."
                                    : "Significant preparation needed. Focus on weak areas."}
                        </p>
                    </div>
                </motion.div>

                {/* Radar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-900 rounded-2xl border border-gray-800 p-6"
                >
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-brand-400" />
                        Performance Breakdown
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Radar */}
                        <ResponsiveContainer width="100%" height={280}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#374151" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                                    labelStyle={{ color: "#fff" }}
                                />
                                <Radar
                                    name="Score"
                                    dataKey="score"
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                    fillOpacity={0.3}
                                />
                            </RadarChart>
                        </ResponsiveContainer>

                        {/* Bar scores */}
                        <div className="space-y-4">
                            {radarData.map((item) => (
                                <ScoreBar key={item.subject} label={item.subject} value={item.score} />
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Weak Areas */}
                {score.weakAreas.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gray-900 rounded-2xl border border-gray-800 p-6"
                    >
                        <h2 className="text-lg font-semibold mb-4 text-red-400">Areas to Improve</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {score.weakAreas.map((area) => (
                                <div
                                    key={area}
                                    className="flex items-center justify-between bg-red-950/30 border border-red-900/50 rounded-xl px-4 py-3"
                                >
                                    <span className="text-sm text-red-300">
                                        {WEAK_AREA_LABELS[area] ?? area}
                                    </span>
                                    <button
                                        onClick={() => router.push(`/dashboard/practice?focus=${area}`)}
                                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                                    >
                                        Practice <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <button
                        onClick={() => router.push("/dashboard/start")}
                        className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-semibold transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Practice Again
                    </button>
                    <button
                        onClick={() => router.push("/dashboard/analytics")}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-colors"
                    >
                        <TrendingUp className="w-4 h-4" />
                        View Analytics
                    </button>
                </motion.div>
            </div>
        </div>
    );
}

// ─── Helper Components ────────────────────────────────────────────────────────

function ScoreBar({ label, value }: { label: string; value: number }) {
    const color =
        value >= 70 ? "bg-visa-green" :
            value >= 45 ? "bg-yellow-400" :
                "bg-red-500";

    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">{label}</span>
                <span className="text-white font-medium">{value}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full ${color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-gray-400">Analyzing your interview…</p>
            </div>
        </div>
    );
}

function ErrorState({ message }: { message: string | null }) {
    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="text-center text-red-400">
                <ShieldAlert className="w-12 h-12 mx-auto mb-4" />
                <p>{message ?? "Failed to load results."}</p>
            </div>
        </div>
    );
}
