/**
 * src/app/(dashboard)/layout.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Protected Dashboard Layout
 * Renders sidebar navigation + main content area
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import {
    LayoutDashboard, Play, BarChart2, Settings,
    BookOpen, Users, CreditCard, HelpCircle,
} from "lucide-react";

const NAV_ITEMS = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/start", label: "Start Simulation", icon: Play },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
    { href: "/dashboard/practice", label: "Practice Mode", icon: BookOpen },
    { href: "/pricing", label: "Upgrade Plan", icon: CreditCard },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="flex h-screen bg-gray-950">
            {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
            <aside className="w-64 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
                {/* Logo */}
                <div className="px-6 py-5 border-b border-gray-800">
                    <Link href="/" className="text-xl font-black text-gradient">BOrderpass</Link>
                    <p className="text-xs text-gray-500 mt-0.5">Visa Interview Simulator</p>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors group"
                        >
                            <item.icon className="w-4 h-4 flex-shrink-0 group-hover:text-brand-400 transition-colors" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* User info */}
                <div className="px-4 py-4 border-t border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-sm font-bold">
                            {session.user.name?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm text-white font-medium truncate">{session.user.name ?? "Student"}</p>
                            <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── Main Content ─────────────────────────────────────────────────────── */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
