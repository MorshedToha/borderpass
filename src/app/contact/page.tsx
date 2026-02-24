/**
 * src/app/contact/page.tsx
 * Contact Page — Support form + quick-access links
 */

"use client";

import { useState } from "react";
import { Mail, MessageSquare, Twitter, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // In production: send to /api/contact or a form service (Formspree, Resend, etc.)
        await new Promise((r) => setTimeout(r, 1000));
        setSent(true);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white py-24 px-6">
            <div className="max-w-4xl mx-auto">

                <div className="text-center mb-16">
                    <h1 className="text-5xl font-black mb-4">
                        Get in <span className="text-gradient">Touch</span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        We typically reply within 24 hours on business days
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Quick Links */}
                    <div className="space-y-4">
                        {[
                            { icon: Mail, label: "Email Support", value: "support@borderpass.ai", href: "mailto:support@borderpass.ai" },
                            { icon: MessageSquare, label: "Discord", value: "Join our community", href: "/discord" },
                            { icon: Twitter, label: "Twitter/X", value: "@borderpassai", href: "https://twitter.com/borderpassai" },
                        ].map((c) => (
                            <a
                                key={c.label}
                                href={c.href}
                                className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors group"
                            >
                                <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center flex-shrink-0">
                                    <c.icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{c.label}</p>
                                    <p className="text-sm text-white font-medium group-hover:text-brand-300 transition-colors">{c.value}</p>
                                </div>
                            </a>
                        ))}

                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                            <p className="text-xs text-gray-500 mb-2">Response Time</p>
                            <p className="text-sm text-white font-medium">Within 24 hours</p>
                            <p className="text-xs text-gray-600 mt-1">Mon – Fri, 9 AM – 6 PM UTC</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-8">
                        {sent ? (
                            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                                <CheckCircle2 className="w-16 h-16 text-visa-green mb-4" />
                                <h2 className="text-xl font-bold text-white mb-2">Message Sent!</h2>
                                <p className="text-gray-400">We'll get back to you within 24 hours.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1.5">Your Name</label>
                                        <input
                                            id="contact-name"
                                            type="text"
                                            required
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder="Jane Smith"
                                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1.5">Email Address</label>
                                        <input
                                            id="contact-email"
                                            type="email"
                                            required
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            placeholder="you@example.com"
                                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-400 mb-1.5">Subject</label>
                                    <select
                                        id="contact-subject"
                                        value={form.subject}
                                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                                    >
                                        <option value="">Select a topic…</option>
                                        <option value="billing">Billing & Subscriptions</option>
                                        <option value="technical">Technical Issue</option>
                                        <option value="feature">Feature Request</option>
                                        <option value="interview">Interview Question</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-400 mb-1.5">Message</label>
                                    <textarea
                                        id="contact-message"
                                        required
                                        rows={5}
                                        value={form.message}
                                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        placeholder="Describe your question or issue in detail…"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full gradient-brand text-white font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? "Sending…" : <><Send className="w-4 h-4" /> Send Message</>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
