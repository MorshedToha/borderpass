/**
 * src/app/admin/layout.tsx
 * Admin Panel Layout — only accessible to users with role=ADMIN
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Users, BookOpen, BarChart2, CreditCard, ShieldCheck } from "lucide-react";

const ADMIN_NAV = [
    { href: "/admin", label: "Overview", icon: ShieldCheck },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/questions", label: "Question Bank", icon: BookOpen },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
    { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

    if (!session?.user || !isAdmin) redirect("/dashboard");

    return (
        <div className="flex h-screen bg-gray-950">
            {/* Admin Sidebar */}
            <aside className="w-60 flex-shrink-0 bg-gray-900 border-r border-gray-800">
                <div className="px-5 py-5 border-b border-gray-800">
                    <Link href="/" className="text-lg font-black text-gradient">BOrderpass</Link>
                    <div className="mt-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3 text-red-400" />
                        <span className="text-xs text-red-400 font-semibold">Admin Panel</span>
                    </div>
                </div>
                <nav className="p-3 space-y-1">
                    {ADMIN_NAV.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
    );
}
