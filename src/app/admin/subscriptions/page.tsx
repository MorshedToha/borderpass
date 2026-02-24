/**
 * src/app/admin/subscriptions/page.tsx
 * Admin — Subscription Management
 */

import { prisma } from "@/lib/prisma";

export default async function AdminSubscriptionsPage() {
    const subscriptions = await prisma.subscription.findMany({
        where: { plan: { in: ["PRO", "PREMIUM"] } },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { updatedAt: "desc" },
    });

    const STATUS_COLOR: Record<string, string> = {
        ACTIVE: "text-visa-green bg-emerald-950/40 border-emerald-900/40",
        PAST_DUE: "text-red-400   bg-red-950/40    border-red-900/40",
        CANCELED: "text-gray-500  bg-gray-800      border-gray-700",
        TRIALING: "text-yellow-400 bg-yellow-950/40 border-yellow-900/40",
        INCOMPLETE: "text-orange-400 bg-orange-950/40 border-orange-900/40",
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
                <span className="text-sm text-gray-500">{subscriptions.length} paying customers</span>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-800">
                        <tr>
                            {["Customer", "Plan", "Status", "Usage", "Stripe ID", "Expires"].map((h) => (
                                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {subscriptions.map((sub) => (
                            <tr key={sub.id} className="hover:bg-gray-800/30 transition-colors">
                                <td className="px-5 py-3">
                                    <p className="text-white font-medium">{sub.user.name ?? "—"}</p>
                                    <p className="text-xs text-gray-500">{sub.user.email}</p>
                                </td>
                                <td className="px-5 py-3">
                                    <span className={`text-xs font-bold ${sub.plan === "PREMIUM" ? "text-yellow-300" : "text-brand-300"}`}>
                                        {sub.plan}
                                    </span>
                                </td>
                                <td className="px-5 py-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLOR[sub.status] ?? "text-gray-400"}`}>
                                        {sub.status}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-gray-400">
                                    {sub.interviewsUsed} / {sub.interviewsLimit === -1 ? "∞" : sub.interviewsLimit}
                                </td>
                                <td className="px-5 py-3 text-gray-600 font-mono text-xs">
                                    {sub.stripeSubscriptionId?.slice(0, 20) ?? "—"}…
                                </td>
                                <td className="px-5 py-3 text-gray-500 text-xs">
                                    {sub.stripeCurrentPeriodEnd
                                        ? new Date(sub.stripeCurrentPeriodEnd).toLocaleDateString()
                                        : "—"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
