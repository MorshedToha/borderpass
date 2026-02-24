/**
 * src/app/admin/questions/page.tsx
 * Admin — Question Bank Management
 */

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";

const CATEGORY_BADGE: Record<string, string> = {
    financial: "text-blue-300 bg-blue-900/40",
    study_intent: "text-purple-300 bg-purple-900/40",
    return_intent: "text-green-300 bg-green-900/40",
    ties: "text-yellow-300 bg-yellow-900/40",
};

export default async function AdminQuestionsPage() {
    const questions = await prisma.question.findMany({
        include: { country: { select: { name: true, flag: true } } },
        orderBy: [{ countryId: "asc" }, { category: "asc" }],
    });

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Question Bank</h1>
                <button className="gradient-brand flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90">
                    <Plus className="w-4 h-4" /> Add Question
                </button>
            </div>

            <div className="space-y-3">
                {questions.map((q) => (
                    <div key={q.id} className="bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 flex items-start justify-between gap-4 hover:border-gray-700 transition-colors">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-white leading-relaxed">{q.text}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-gray-500">{q.country.flag} {q.country.name}</span>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_BADGE[q.category] ?? "text-gray-400 bg-gray-800"}`}>
                                    {q.category.replace("_", " ")}
                                </span>
                                <span className="text-xs text-gray-600">Difficulty: {q.difficulty}/5</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${q.isActive ? "text-visa-green bg-emerald-950/40" : "text-gray-500 bg-gray-800"}`}>
                                {q.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
