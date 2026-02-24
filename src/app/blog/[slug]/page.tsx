/**
 * src/app/blog/[slug]/page.tsx
 * Dynamic Blog Post — renders a single article by slug
 * In production: replace POSTS_CONTENT with a CMS (Contentful, Sanity, MDX)
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

const POSTS_CONTENT: Record<string, { title: string; category: string; date: string; readMin: number; content: string }> = {
    "how-to-pass-f1-visa-interview": {
        title: "How to Pass Your F-1 Visa Interview in 2025",
        category: "Study Visa",
        date: "January 15, 2025",
        readMin: 8,
        content: `
## Understanding the F-1 Interview

The F-1 student visa interview is typically brief — averaging just 2-5 minutes. The consular officer makes a rapid assessment based on your responses. Your goal is to convey three things clearly: **why you're going**, **how you'll pay**, and **why you'll come back**.

## The Most Common Questions

1. **Why did you choose this university?** — Be specific. Name the program, faculty, research opportunities, or ranking.
2. **How will you fund your education?** — Have exact figures ready: tuition, living costs, and your source of funding.
3. **What do you plan to do after graduating?** — Show clear home-country career plans.
4. **Do you have family in the US?** — Answer honestly. Having relatives doesn't necessarily hurt you.
5. **Why can't you study this in your home country?** — Be prepared with genuine reasons about program quality or specialization.

## Key Tips

- **Speak clearly and confidently.** Officers notice hesitation.
- **Bring all documents**, but don't overwhelm the officer with paper.
- **Keep answers concise.** One to three sentences is ideal.
- **Don't memorize scripts.** Authentic answers sound far better.

## Practice Makes Perfect

The best way to prepare is to simulate the interview experience. Use BOrderpass to practice with our AI visa officer and get scored on all five key dimensions before your real appointment.
    `.trim(),
    },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const post = POSTS_CONTENT[params.slug];
    if (!post) return { title: "Post Not Found" };
    return { title: post.title, description: `${post.category} · ${post.readMin} min read` };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = POSTS_CONTENT[params.slug];
    if (!post) notFound();

    // Render markdown-like content (headings, bold, lists)
    const renderContent = (text: string) =>
        text
            .split("\n")
            .map((line, i) => {
                if (line.startsWith("## ")) return <h2 key={i} className="text-2xl font-bold text-white mt-8 mb-3">{line.slice(3)}</h2>;
                if (line.startsWith("- **")) {
                    const match = line.match(/- \*\*(.+?)\*\* — (.+)/);
                    if (match) return (
                        <li key={i} className="text-gray-300 mb-2">
                            <span className="text-white font-semibold">{match[1]}</span> — {match[2]}
                        </li>
                    );
                }
                if (line.startsWith("- ")) return <li key={i} className="text-gray-300 mb-2">{line.slice(2)}</li>;
                if (line.startsWith("1. ") || line.match(/^\d\. /)) {
                    const content = line.replace(/^\d+\.\s+/, "");
                    const match = content.match(/\*\*(.+?)\*\* — (.+)/);
                    if (match) return (
                        <li key={i} className="text-gray-300 mb-2">
                            <span className="text-white font-semibold">{match[1]}</span> — {match[2]}
                        </li>
                    );
                    return <li key={i} className="text-gray-300 mb-2">{content}</li>;
                }
                if (line.trim() === "") return <br key={i} />;
                return <p key={i} className="text-gray-300 leading-relaxed mb-3">{line.replace(/\*\*(.+?)\*\*/g, "$1")}</p>;
            });

    return (
        <div className="min-h-screen bg-gray-950 text-white py-24 px-6">
            <div className="max-w-2xl mx-auto">
                <Link href="/blog" className="text-sm text-brand-400 hover:text-brand-300 mb-8 inline-flex items-center gap-1">
                    ← Back to Blog
                </Link>

                <div className="mt-4 mb-8">
                    <span className="text-xs text-brand-400 font-semibold">{post.category}</span>
                    <h1 className="text-4xl font-black text-white mt-2 mb-4 leading-tight">{post.title}</h1>
                    <p className="text-sm text-gray-500">{post.date} · {post.readMin} min read</p>
                </div>

                <div className="prose prose-invert max-w-none">
                    <ul className="space-y-1">{renderContent(post.content)}</ul>
                </div>

                {/* CTA */}
                <div className="mt-16 gradient-brand rounded-2xl p-6 text-center">
                    <p className="font-bold text-white text-lg mb-2">Ready to Practice?</p>
                    <p className="text-blue-200 text-sm mb-4">Try a free AI visa interview simulation now</p>
                    <Link href="/signup" className="bg-white text-brand-700 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors inline-block">
                        Start Free Interview
                    </Link>
                </div>
            </div>
        </div>
    );
}
