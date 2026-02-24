/**
 * src/app/blog/page.tsx
 * Blog Index — List of articles for SEO + content marketing
 */

import Link from "next/link";
import { ArrowRight, Clock, User } from "lucide-react";

const POSTS = [
    {
        slug: "how-to-pass-f1-visa-interview",
        title: "How to Pass Your F-1 Visa Interview in 2025",
        excerpt: "A first-time applicant's complete guide to answering the most common student visa questions with confidence.",
        category: "Study Visa",
        date: "2025-01-15",
        readMin: 8,
        author: "BOrderpass Team",
    },
    {
        slug: "financial-credibility-visa",
        title: "Financial Credibility: The #1 Reason Visas Get Rejected",
        excerpt: "Visa officers scrutinize your financial story above everything else. Here's exactly what they want to hear.",
        category: "Finance",
        date: "2025-02-01",
        readMin: 6,
        author: "BOrderpass Team",
    },
    {
        slug: "uk-student-visa-tips",
        title: "UK Student Visa Interview: 7 Questions You Must Prepare For",
        excerpt: "The UK visa interview is short but intense. Practice these exact questions before your appointment.",
        category: "UK Visa",
        date: "2025-02-10",
        readMin: 5,
        author: "BOrderpass Team",
    },
    {
        slug: "canada-study-permit-mistakes",
        title: "Top 5 Mistakes That Get Canadian Study Permits Denied",
        excerpt: "We analyzed 500+ rejection cases. These five mistakes come up again and again — and they're all avoidable.",
        category: "Canada",
        date: "2025-02-18",
        readMin: 7,
        author: "BOrderpass Team",
    },
    {
        slug: "return-intent-visa-interview",
        title: "Proving Return Intent: What Visa Officers Actually Want",
        excerpt: "Your biggest job in the interview is convincing the officer you will come home. Here's how to make it believable.",
        category: "Strategy",
        date: "2025-03-01",
        readMin: 6,
        author: "BOrderpass Team",
    },
    {
        slug: "ai-visa-preparation",
        title: "How AI Is Changing Visa Interview Preparation",
        excerpt: "Real-time voice AI can now simulate the visa interview experience with surprising accuracy. Here's what that means for students.",
        category: "Technology",
        date: "2025-03-08",
        readMin: 4,
        author: "BOrderpass Team",
    },
];

const CATEGORY_COLORS: Record<string, string> = {
    "Study Visa": "text-brand-300 bg-brand-900/50",
    "Finance": "text-yellow-300 bg-yellow-900/30",
    "UK Visa": "text-indigo-300 bg-indigo-900/40",
    "Canada": "text-red-300   bg-red-900/30",
    "Strategy": "text-green-300 bg-green-900/30",
    "Technology": "text-purple-300 bg-purple-900/30",
};

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-gray-950 text-white py-24 px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-black mb-4">
                        Visa Prep <span className="text-gradient">Blog</span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Expert guides, tips, and strategies to help you ace your visa interview
                    </p>
                </div>

                {/* Featured Post */}
                <Link
                    href={`/blog/${POSTS[0]!.slug}`}
                    className="block bg-gradient-to-r from-brand-950/60 to-gray-900 border border-brand-800/40 rounded-2xl p-8 mb-8 hover:border-brand-600/60 transition-colors group"
                >
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${CATEGORY_COLORS[POSTS[0]!.category]}`}>
                        ⭐ Featured · {POSTS[0]!.category}
                    </span>
                    <h2 className="text-2xl font-bold text-white mt-4 mb-3 group-hover:text-brand-300 transition-colors">
                        {POSTS[0]!.title}
                    </h2>
                    <p className="text-gray-400 mb-4">{POSTS[0]!.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{POSTS[0]!.author}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{POSTS[0]!.readMin} min read</span>
                        <span>{POSTS[0]!.date}</span>
                    </div>
                </Link>

                {/* Post Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {POSTS.slice(1).map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 hover:bg-gray-800/50 transition-all group"
                        >
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[post.category] ?? "text-gray-400 bg-gray-800"}`}>
                                {post.category}
                            </span>
                            <h2 className="text-base font-bold text-white mt-3 mb-2 group-hover:text-brand-300 transition-colors leading-snug">
                                {post.title}
                            </h2>
                            <p className="text-gray-500 text-sm mb-4 leading-relaxed line-clamp-2">{post.excerpt}</p>
                            <div className="flex items-center justify-between text-xs text-gray-600">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readMin} min</span>
                                <span className="text-brand-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Read more <ArrowRight className="w-3 h-3" />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
