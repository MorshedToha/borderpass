/**
 * src/app/(dashboard)/dashboard/analytics/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Analytics Page — Session history, score trends, dimension breakdown
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default async function AnalyticsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    // Fetch all scores with session date
    const scores = await prisma.score.findMany({
        where: { userId: session.user.id },
        include: { session: { include: { country: true } } },
        orderBy: { createdAt: "asc" },
        take: 30,
    });

    const subscription = await prisma.subscription.findUnique({
        where: { userId: session.user.id },
    });
    const isPremium = subscription?.plan === "PREMIUM";

    // Build trend data
    const trendData = scores.map((s, i) => ({
        session: `#${i + 1}`,
        score: s.overallScore,
        financial: s.financialCredibility,
        study: s.studyIntent,
        returning: s.returnIntent,
        confidence: s.confidenceScore,
        date: new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));

    // Dimension averages
    const avg = (arr: number[]) =>
        arr.length === 0 ? 0 : Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

    const dimData = [
        { name: "Financial", value: avg(scores.map((s) => s.financialCredibility)), color: "#3b82f6" },
        { name: "Study Intent", value: avg(scores.map((s) => s.studyIntent)), color: "#8b5cf6" },
        { name: "Return Intent", value: avg(scores.map((s) => s.returnIntent)), color: "#10b981" },
        { name: "Confidence", value: avg(scores.map((s) => s.confidenceScore)), color: "#f59e0b" },
        { name: "Consistency", value: avg(scores.map((s) => s.consistencyScore)), color: "#ec4899" },
    ];

    // Trend arrow
    const lastTwo = scores.slice(-2);
    const trend =
        lastTwo.length < 2 ? "flat" :
            lastTwo[1].overallScore > lastTwo[0].overallScore ? "up" : "down";

    const avgScore = avg(scores.map((s) => s.overallScore));

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Analytics</h1>
                    <p className="text-gray-400 mt-1">Your performance over time</p>
                </div>
                {!isPremium && (
                    <Link
                        href="/pricing"
                        className="text-xs bg-visa-purple/20 border border-visa-purple/40 text-visa-purple px-4 py-2 rounded-xl hover:bg-visa-purple/30 transition-colors"
                    >
                        Unlock Advanced Analytics →
                    </Link>
                )}
            </div>

            {scores.length === 0 ? (
                /* Empty state */
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
                    <p className="text-4xl mb-4">📊</p>
                    <p className="text-xl font-semibold text-white mb-2">No data yet</p>
                    <p className="text-gray-400 mb-6">Complete your first interview to see analytics</p>
                    <Link
                        href="/dashboard/start"
                        className="gradient-brand text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
                    >
                        Start First Interview
                    </Link>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Total Sessions", value: scores.length.toString() },
                            {
                                label: "Avg. Score",
                                value: `${avgScore}/100`,
                                extra:
                                    trend === "up" ? <TrendingUp className="w-4 h-4 text-visa-green" /> :
                                        trend === "down" ? <TrendingDown className="w-4 h-4 text-red-400" /> :
                                            <Minus className="w-4 h-4 text-gray-500" />,
                            },
                            {
                                label: "Best Score",
                                value: `${Math.max(...scores.map((s) => s.overallScore))}/100`,
                            },
                            {
                                label: "Risk Level",
                                value: scores[scores.length - 1]?.riskLevel ?? "—",
                            },
                        ].map((card) => (
                            <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                                <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-bold text-white">{card.value}</p>
                                    {(card as { extra?: React.ReactNode }).extra}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Score Trend Line Chart */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <h2 className="text-sm font-semibold text-gray-300 mb-5">Overall Score Trend</h2>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} />
                                <YAxis domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                                    labelStyle={{ color: "#fff" }}
                                    itemStyle={{ color: "#93c5fd" }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#3b82f6"
                                    strokeWidth={2.5}
                                    dot={{ fill: "#3b82f6", r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Dimension Bar Chart */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <h2 className="text-sm font-semibold text-gray-300 mb-5">
                            Average Score by Dimension
                        </h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={dimData} barSize={36}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} />
                                <YAxis domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                                    labelStyle={{ color: "#fff" }}
                                />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                    {dimData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Premium locked: confidence over time */}
                    {!isPremium && (
                        <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 overflow-hidden">
                            <div className="absolute inset-0 bg-gray-950/70 flex flex-col items-center justify-center z-10 rounded-2xl">
                                <p className="text-lg font-bold text-white mb-2">🔒 Premium Feature</p>
                                <p className="text-sm text-gray-400 mb-4 text-center">
                                    Confidence tracking over time requires Premium
                                </p>
                                <Link
                                    href="/pricing"
                                    className="gradient-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90"
                                >
                                    Upgrade to Premium
                                </Link>
                            </div>
                            <h2 className="text-sm font-semibold text-gray-300 mb-5">Confidence Tracking</h2>
                            <div className="h-40 bg-gray-800 rounded-xl blur-sm" />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
