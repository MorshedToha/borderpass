/**
 * src/app/admin/users/page.tsx
 * Admin — Users Management Table
 */

import { prisma } from "@/lib/prisma";
import { UserCircle } from "lucide-react";

export default async function AdminUsersPage() {
    const users = await prisma.user.findMany({
        include: { subscription: true },
        orderBy: { createdAt: "desc" },
        take: 100,
    });

    const PLAN_COLOR: Record<string, string> = {
        FREE: "text-gray-400 bg-gray-800",
        PRO: "text-brand-300 bg-brand-900/50",
        PREMIUM: "text-yellow-300 bg-yellow-900/30",
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Users</h1>
                <span className="text-sm text-gray-500">{users.length} total</span>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-800">
                        <tr className="text-left">
                            {["User", "Email", "Plan", "Interviews Used", "Joined", "Role"].map((h) => (
                                <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {users.map((user) => {
                            const plan = user.subscription?.plan ?? "FREE";
                            return (
                                <tr key={user.id} className="hover:bg-gray-800/40 transition-colors">
                                    <td className="px-5 py-3 flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-brand-800 flex items-center justify-center text-xs text-white font-bold">
                                            {user.name?.[0]?.toUpperCase() ?? "?"}
                                        </div>
                                        <span className="text-white font-medium">{user.name ?? "—"}</span>
                                    </td>
                                    <td className="px-5 py-3 text-gray-400">{user.email}</td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PLAN_COLOR[plan]}`}>
                                            {plan}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-gray-400">
                                        {user.subscription
                                            ? `${user.subscription.interviewsUsed} / ${user.subscription.interviewsLimit === -1 ? "∞" : user.subscription.interviewsLimit
                                            }`
                                            : "0 / 1"}
                                    </td>
                                    <td className="px-5 py-3 text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === "ADMIN"
                                                ? "bg-red-900/40 text-red-400"
                                                : "bg-gray-800 text-gray-500"
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
