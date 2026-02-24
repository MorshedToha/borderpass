/**
 * src/app/(dashboard)/dashboard/practice/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Practice Mode — Focus on weak areas, text-based targeted Q&A
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, RotateCcw, CheckCircle2, BookOpen } from "lucide-react";

type Category =
    | "financial_credibility"
    | "study_intent"
    | "return_intent"
    | "confidence"
    | "consistency";

const CATEGORY_LABELS: Record<Category, string> = {
    financial_credibility: "Financial Credibility",
    study_intent: "Study Intent",
    return_intent: "Return Intent",
    confidence: "Speech Confidence",
    consistency: "Answer Consistency",
};

const SAMPLE_QUESTIONS: Record<string, string[]> = {
    financial_credibility: [
        "Who is your financial sponsor and what is their occupation?",
        "Can you describe the bank statements you've prepared for your visa application?",
        "How much money do you have available to fund your studies?",
        "Do you have any scholarships or institutional funding?",
    ],
    study_intent: [
        "Why did you specifically choose this university?",
        "Why can't you complete this degree in your home country?",
        "What are your academic goals and how does this program help achieve them?",
        "Describe the specific program or course you have been accepted into.",
    ],
    return_intent: [
        "What are your plans after completing your studies?",
        "What ties do you have to your home country?",
        "Do you have family members waiting for you back home?",
        "What career opportunities await you when you return?",
    ],
    confidence: [
        "Tell me about yourself in one minute.",
        "Why should I approve your visa today?",
        "Summarize your financial situation clearly and confidently.",
        "What makes you different from other applicants?",
    ],
    consistency: [
        "Walk me through your study plan from start to finish.",
        "Explain your full financial plan step by step.",
        "Who will be responsible for your stay and how exactly?",
        "What is your step-by-step return plan after graduation?",
    ],
};

interface Message {
    id: string;
    role: "AI" | "STUDENT";
    text: string;
    correct?: boolean;
}

export default function PracticeModePage() {
    const searchParams = useSearchParams();
    const focusParam = searchParams.get("focus") as Category | null;

    const [selectedCategory, setSelectedCategory] = useState<Category>(
        focusParam ?? "financial_credibility"
    );
    const [questionIdx, setQuestionIdx] = useState(0);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [sessionDone, setSessionDone] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const questions = SAMPLE_QUESTIONS[selectedCategory] ?? [];

    // Start with first question
    useEffect(() => {
        resetSession(selectedCategory);
    }, [selectedCategory]);

    // Auto scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    function resetSession(cat: Category) {
        setQuestionIdx(0);
        setSessionDone(false);
        setMessages([
            {
                id: crypto.randomUUID(),
                role: "AI",
                text: (SAMPLE_QUESTIONS[cat] ?? [])[0] ?? "Session complete.",
            },
        ]);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim() || isEvaluating) return;

        const studentMsg: Message = {
            id: crypto.randomUUID(),
            role: "STUDENT",
            text: input.trim(),
        };
        setMessages((prev) => [...prev, studentMsg]);
        setInput("");
        setIsEvaluating(true);

        // Simple evaluation via OpenAI feedback API
        try {
            const res = await fetch("/api/practice/evaluate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: questions[questionIdx],
                    answer: studentMsg.text,
                    category: selectedCategory,
                }),
            });
            const data = await res.json();

            const feedbackMsg: Message = {
                id: crypto.randomUUID(),
                role: "AI",
                text: data.feedback ?? "Good answer! Let's continue.",
                correct: data.score > 60,
            };
            setMessages((prev) => [...prev, feedbackMsg]);

            // Move to next question
            const nextIdx = questionIdx + 1;
            if (nextIdx < questions.length) {
                setTimeout(() => {
                    setMessages((prev) => [
                        ...prev,
                        { id: crypto.randomUUID(), role: "AI", text: questions[nextIdx]! },
                    ]);
                    setQuestionIdx(nextIdx);
                }, 1200);
            } else {
                setTimeout(() => {
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: crypto.randomUUID(),
                            role: "AI",
                            text: "🎉 Great work! You've completed all practice questions for this area. Keep practicing to improve your score!",
                        },
                    ]);
                    setSessionDone(true);
                }, 1200);
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                { id: crypto.randomUUID(), role: "AI", text: "Good effort! Try to be more specific next time." },
            ]);
        }

        setIsEvaluating(false);
    }

    return (
        <div className="flex h-full flex-col md:flex-row">
            {/* Sidebar — Category Picker */}
            <aside className="w-full md:w-56 flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-800 bg-gray-900 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" /> Focus Area
                </p>
                <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                    {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`flex-shrink-0 text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${selectedCategory === cat
                                    ? "bg-brand-700 text-white font-semibold"
                                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                                }`}
                        >
                            {CATEGORY_LABELS[cat]}
                        </button>
                    ))}
                </div>

                <div className="hidden md:block mt-6 pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-500 mb-1">Progress</p>
                    <p className="text-sm font-bold text-white">
                        {questionIdx} / {questions.length} questions
                    </p>
                    <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brand-500 rounded-full transition-all"
                            style={{ width: `${(questionIdx / questions.length) * 100}%` }}
                        />
                    </div>
                </div>
            </aside>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 bg-gray-900">
                    <h2 className="text-sm font-semibold text-white">
                        Practice: {CATEGORY_LABELS[selectedCategory]}
                    </h2>
                    <button
                        onClick={() => resetSession(selectedCategory)}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> Restart
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-3 ${msg.role === "AI" ? "flex-row" : "flex-row-reverse"}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm ${msg.role === "AI" ? "bg-brand-900 text-brand-300" : "bg-emerald-900 text-emerald-300"
                                    }`}>
                                    {msg.role === "AI" ? "🧑‍💼" : "🎓"}
                                </div>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "AI"
                                        ? "bg-gray-800 text-gray-100 rounded-tl-sm"
                                        : "bg-brand-700 text-white rounded-tr-sm"
                                    }`}>
                                    {msg.text}
                                    {msg.correct !== undefined && (
                                        <span className={`ml-2 inline-flex items-center gap-1 text-xs ${msg.correct ? "text-visa-green" : "text-yellow-400"
                                            }`}>
                                            {msg.correct ? <><CheckCircle2 className="w-3 h-3" /> Good</> : "⚠ Needs work"}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isEvaluating && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-900 flex items-center justify-center text-sm">🧑‍💼</div>
                            <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                                <div className="flex gap-1">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            className="w-1.5 h-1.5 rounded-full bg-gray-500"
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form
                    onSubmit={handleSubmit}
                    className="border-t border-gray-800 p-4 flex gap-3"
                >
                    <input
                        id="practice-input"
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={sessionDone ? "Session complete! Pick another category." : "Type your answer…"}
                        disabled={sessionDone || isEvaluating}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 disabled:opacity-40 transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || sessionDone || isEvaluating}
                        className="gradient-brand text-white p-3 rounded-xl disabled:opacity-40 hover:opacity-90 transition-all"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
