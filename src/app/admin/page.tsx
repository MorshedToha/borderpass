/**
 * src/app/admin/page.tsx
 * Admin Overview Dashboard
 */

import { prisma } from "@/lib/prisma";
import { Users, MessageSquare, BarChart2, CreditCard } from "lucide-react";

export default async function AdminOverviewPage() {
    const [totalUsers, totalSessions, totalScores, planBreakdown] = await Promise.all([
        prisma.user.count(),
        prisma.interviewSession.count(),
        prisma.score.count(),
        prisma.subscription.groupBy({ by: ["plan"], _count: { plan: true } }),
    ]);

    const revenueMetrics = {
        pro: planBreakdown.find((p) => p.plan === "PRO")?._count.plan ?? 0,
        premium: planBreakdown.find((p) => p.plan === "PREMIUM")?._count.plan ?? 0,
    };

    const stats = [
        { label: "Total Users", value: totalUsers, icon: Users, color: "text-brand-400" },
        { label: "Total Sessions", value: totalSessions, icon: MessageSquare, color: "text-visa-green" },
        { label: "Scores Generated", value: totalScores, icon: BarChart2, color: "text-yellow-400" },
        {
            label: "Paying Customers",
            value: revenueMetrics.pro + revenueMetrics.premium,
            icon: CreditCard,
            color: "text-visa-purple",
        },
    ];

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-2xl font-bold text-white">Admin Overview</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((s) => (
                    <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                        <s.icon className={`w-6 h-6 ${s.color} mb-3`} />
                        <p className="text-3xl font-black text-white">{s.value.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Plan Breakdown */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-gray-400 mb-5">Subscription Breakdown</h2>
                <div className="space-y-3">
                    {planBreakdown.map((p) => {
                        const pct = totalUsers > 0 ? Math.round((p._count.plan / totalUsers) * 100) : 0;
                        const BAR_COLOR: Record<string, string> = {
                            FREE: "bg-gray-600", PRO: "bg-brand-500", PREMIUM: "bg-yellow-500",
                        };
                        return (
                            <div key={p.plan}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">{p.plan}</span>
                                    <span className="text-white font-medium">{p._count.plan} users ({pct}%)</span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${BAR_COLOR[p.plan] ?? "bg-gray-500"} rounded-full`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
