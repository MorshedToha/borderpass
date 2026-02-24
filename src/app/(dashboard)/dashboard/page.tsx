/**
 * src/app/(dashboard)/dashboard/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Dashboard Overview — Shows usage stats, upgrade prompt, recent sessions
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Play, BarChart2, TrendingUp, Zap } from "lucide-react";

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    // Fetch data in parallel
    const [subscription, recentSessions, totalSessions, avgScore] = await Promise.all([
        prisma.subscription.findUnique({ where: { userId: session.user.id } }),
        prisma.interviewSession.findMany({
            where: { userId: session.user.id },
            include: { country: true, score: true },
            orderBy: { createdAt: "desc" },
            take: 5,
        }),
        prisma.interviewSession.count({ where: { userId: session.user.id } }),
        prisma.score.aggregate({
            where: { userId: session.user.id },
            _avg: { overallScore: true },
        }),
    ]);

    const plan = subscription?.plan ?? "FREE";
    const used = subscription?.interviewsUsed ?? 0;
    const limit = subscription?.interviewsLimit ?? 1;
    const usagePercent = limit === -1 ? 0 : Math.round((used / limit) * 100);
    const avgScoreValue = Math.round(avgScore._avg.overallScore ?? 0);

    return (
        <div className="p-8 space-y-8">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">
                    Welcome back, {session.user.name?.split(" ")[0] ?? "Student"} 👋
                </h1>
                <p className="text-gray-400 mt-1">Here's your visa prep summary</p>
            </div>

            {/* Upgrade Banner for FREE users */}
            {plan === "FREE" && (
                <div className="gradient-brand rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <p className="font-bold text-white text-lg">Upgrade to Pro</p>
                        <p className="text-blue-200 text-sm mt-1">
                            Get 10 live voice interviews, detailed scoring, and weak area retry
                        </p>
                    </div>
                    <Link
                        href="/pricing"
                        className="bg-white text-brand-700 font-bold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2 flex-shrink-0"
                    >
                        <Zap className="w-4 h-4" /> Upgrade Now
                    </Link>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        icon: Play,
                        label: "Interviews Done",
                        value: totalSessions.toString(),
                        color: "text-brand-400",
                        bg: "bg-brand-950/50",
                    },
                    {
                        icon: TrendingUp,
                        label: "Avg. Score",
                        value: avgScoreValue > 0 ? `${avgScoreValue}/100` : "—",
                        color: "text-visa-green",
                        bg: "bg-emerald-950/50",
                    },
                    {
                        icon: BarChart2,
                        label: "Sessions Used",
                        value: limit === -1 ? `${used} / ∞` : `${used} / ${limit}`,
                        color: "text-yellow-400",
                        bg: "bg-yellow-950/50",
                    },
                    {
                        icon: Zap,
                        label: "Current Plan",
                        value: plan,
                        color: "text-visa-purple",
                        bg: "bg-purple-950/50",
                    },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className={`${stat.bg} rounded-2xl border border-gray-800 p-5 flex items-start gap-4`}
                    >
                        <div className={`${stat.bg} p-2.5 rounded-xl`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Usage Progress Bar */}
            {plan !== "PREMIUM" && (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Interview Usage</span>
                        <span className="text-gray-300">{used} / {limit === -1 ? "∞" : limit}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${usagePercent >= 80 ? "bg-red-500" : "bg-brand-500"
                                }`}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                    </div>
                    {usagePercent >= 80 && (
                        <p className="text-xs text-red-400 mt-2">
                            Almost at your limit.{" "}
                            <Link href="/pricing" className="underline hover:text-red-300">Upgrade now</Link>
                        </p>
                    )}
                </div>
            )}

            {/* Start Button */}
            <Link
                href="/dashboard/start"
                className="flex items-center justify-center gap-3 gradient-brand text-white font-bold text-lg py-4 rounded-2xl hover:opacity-90 transition-all hover:scale-[1.01]"
            >
                <Play className="w-5 h-5" />
                Start New Interview Simulation
            </Link>

            {/* Recent Sessions */}
            {recentSessions.length > 0 && (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-800">
                        <h2 className="font-semibold text-gray-200">Recent Sessions</h2>
                    </div>
                    <div className="divide-y divide-gray-800">
                        {recentSessions.map((s) => (
                            <Link
                                key={s.id}
                                href={`/dashboard/results?sessionId=${s.id}`}
                                className="flex items-center justify-between px-6 py-4 hover:bg-gray-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{s.country.flag}</span>
                                    <div>
                                        <p className="text-sm font-medium text-white">{s.country.name} Interview</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(s.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                {s.score ? (
                                    <span className={`text-sm font-bold ${s.score.overallScore >= 70 ? "text-visa-green" :
                                            s.score.overallScore >= 45 ? "text-yellow-400" :
                                                "text-red-400"
                                        }`}>
                                        {s.score.overallScore}/100
                                    </span>
                                ) : (
                                    <span className="text-xs text-gray-600 capitalize">{s.status.toLowerCase()}</span>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
