/**
 * src/app/signup/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Signup Page — Register with email/password or Google
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, User, Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 1. Create account via API
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
            setError(data.error ?? "Registration failed. Please try again.");
            setLoading(false);
            return;
        }

        // 2. Auto sign-in
        const signInRes = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        setLoading(false);

        if (signInRes?.error) {
            setError("Account created! Please sign in manually.");
            router.push("/login");
        } else {
            router.push("/dashboard");
        }
    };

    const passwordStrength = (pwd: string): { label: string; color: string; width: string } => {
        if (pwd.length === 0) return { label: "", color: "bg-gray-700", width: "0%" };
        if (pwd.length < 6) return { label: "Weak", color: "bg-red-500", width: "33%" };
        if (pwd.length < 10) return { label: "Fair", color: "bg-yellow-500", width: "66%" };
        return { label: "Strong", color: "bg-visa-green", width: "100%" };
    };

    const strength = passwordStrength(password);

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-brand-600/15 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md relative">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="text-3xl font-black text-gradient">BOrderpass</Link>
                    <p className="text-gray-400 mt-2 text-sm">Create your free account — no credit card needed</p>
                </div>

                {/* Benefits pill */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {["1 Free Interview", "Instant Scoring", "AI Voice Officer"].map((b) => (
                        <span key={b} className="flex items-center gap-1 bg-brand-950/60 border border-brand-800/50 text-brand-300 text-xs px-3 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" /> {b}
                        </span>
                    ))}
                </div>

                {/* Card */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">

                    {/* Google OAuth */}
                    <button
                        id="google-signup"
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                        className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold py-3 rounded-xl hover:bg-gray-100 transition-colors mb-6"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign up with Google
                    </button>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-gray-800" />
                        <span className="text-xs text-gray-600">or with email</span>
                        <div className="flex-1 h-px bg-gray-800" />
                    </div>

                    {error && (
                        <div className="bg-red-950/50 border border-red-900/50 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Full name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Jane Smith"
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Email address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                <input
                                    id="signup-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                <input
                                    id="signup-password"
                                    type={showPwd ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min. 8 characters"
                                    required
                                    minLength={8}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd(!showPwd)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                                >
                                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {/* Strength meter */}
                            {password.length > 0 && (
                                <div className="mt-2">
                                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${strength.color} rounded-full transition-all duration-300`}
                                            style={{ width: strength.width }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{strength.label}</p>
                                </div>
                            )}
                        </div>

                        <p className="text-xs text-gray-600">
                            By signing up you agree to our{" "}
                            <Link href="/terms" className="text-brand-400 hover:underline">Terms</Link> and{" "}
                            <Link href="/privacy" className="text-brand-400 hover:underline">Privacy Policy</Link>.
                        </p>

                        <button
                            type="submit"
                            id="signup-submit"
                            disabled={loading}
                            className="w-full gradient-brand text-white font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</> : "Create Free Account"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{" "}
                        <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
