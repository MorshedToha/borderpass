/**
 * src/app/api/practice/evaluate/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/practice/evaluate
 * Evaluate a practice answer using OpenAI and return feedback + score
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const schema = z.object({
    question: z.string().min(5),
    answer: z.string().min(1),
    category: z.string(),
});

export async function POST(req: NextRequest) {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { question, answer, category } = parsed.data;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a visa interview coach evaluating a student's practice answer.
Category being evaluated: ${category}.
Give constructive, specific feedback in 1-2 sentences. Then provide a numeric score 0-100.
Respond ONLY in JSON: {"feedback": "...", "score": 75}`,
                },
                {
                    role: "user",
                    content: `Question: ${question}\nAnswer: ${answer}`,
                },
            ],
            response_format: { type: "json_object" },
            max_tokens: 200,
        });

        const content = completion.choices[0]?.message?.content ?? '{"feedback":"Good attempt!","score":65}';
        const result = JSON.parse(content) as { feedback: string; score: number };

        return NextResponse.json(result);
    } catch {
        return NextResponse.json({ feedback: "Good attempt! Keep practicing.", score: 60 });
    }
}
