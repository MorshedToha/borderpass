/**
 * src/app/admin/analytics/page.tsx
 * Admin Analytics — Platform-wide metrics
 */

import { prisma } from "@/lib/prisma";

export default async function AdminAnalyticsPage() {
    const [dailySessions, avgScoreByCountry, riskBreakdown] = await Promise.all([
        // Sessions per day (last 7 days)
        prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT DATE("createdAt")::text AS date, COUNT(*) AS count
      FROM interview_sessions
      WHERE "createdAt" >= NOW() - INTERVAL '7 days'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
        // Avg score by country
        prisma.$queryRaw<{ country: string; avg_score: number }[]>`
      SELECT c.name AS country, ROUND(AVG(s."overallScore"), 1) AS avg_score
      FROM scores s
      JOIN interview_sessions i ON s."sessionId" = i.id
      JOIN countries c ON i."countryId" = c.id
      GROUP BY c.name
    `,
        // Risk level distribution
        prisma.score.groupBy({
            by: ["riskLevel"],
            _count: { riskLevel: true },
        }),
    ]);

    const totalRisk = riskBreakdown.reduce((s, r) => s + r._count.riskLevel, 0);

    const RISK_COLOR: Record<string, string> = {
        LOW: "bg-visa-green",
        MODERATE: "bg-yellow-500",
        HIGH: "bg-red-500",
    };

    return (
        <div className="p-8 space-y-8 max-w-5xl">
            <h1 className="text-2xl font-bold text-white">Platform Analytics</h1>

            {/* Daily Sessions */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-gray-400 mb-4">Sessions (Last 7 Days)</h2>
                <div className="flex items-end gap-3 h-24">
                    {dailySessions.map((d) => {
                        const count = Number(d.count);
                        const max = Math.max(...dailySessions.map((x) => Number(x.count)), 1);
                        const pct = Math.round((count / max) * 100);
                        return (
                            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-xs text-gray-500">{count}</span>
                                <div className="w-full bg-gray-800 rounded-t-lg" style={{ height: 64 }}>
                                    <div
                                        className="w-full bg-brand-500 rounded-t-lg"
                                        style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-600">
                                    {new Date(d.date).toLocaleDateString("en-US", { weekday: "short" })}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Avg Score by Country */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h2 className="text-sm font-semibold text-gray-400 mb-4">Avg Score by Country</h2>
                    <div className="space-y-3">
                        {avgScoreByCountry.map((row) => (
                            <div key={row.country}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-300">{row.country}</span>
                                    <span className="text-white font-bold">{row.avg_score}</span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-brand-500 rounded-full"
                                        style={{ width: `${row.avg_score}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Risk Level Distribution */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h2 className="text-sm font-semibold text-gray-400 mb-4">Risk Level Distribution</h2>
                    <div className="space-y-3">
                        {riskBreakdown.map((r) => {
                            const pct = totalRisk > 0 ? Math.round((r._count.riskLevel / totalRisk) * 100) : 0;
                            return (
                                <div key={r.riskLevel}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300">{r.riskLevel}</span>
                                        <span className="text-white font-bold">{r._count.riskLevel} ({pct}%)</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${RISK_COLOR[r.riskLevel] ?? "bg-gray-500"} rounded-full`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
