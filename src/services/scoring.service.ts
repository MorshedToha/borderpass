/**
 * src/services/scoring.service.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Scoring Engine — Independent module (no React, no DB imports)
 *
 * Responsibilities:
 *  - Analyze interview transcript
 *  - Score five dimensions: financial credibility, study intent,
 *    return intent, confidence, consistency
 *  - Optionally call OpenAI for deeper semantic analysis
 *  - Return structured ScoreResult
 * ─────────────────────────────────────────────────────────────────────────────
 */

import OpenAI from "openai";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TranscriptEntry {
    speaker: "STUDENT" | "AI";
    text: string;
    timestamp: number; // seconds from session start
}

export interface ScoreResult {
    overallScore: number;          // 0–100
    riskLevel: "LOW" | "MODERATE" | "HIGH";
    financialCredibility: number;  // 0–100
    studyIntent: number;           // 0–100
    returnIntent: number;          // 0–100
    confidenceScore: number;       // 0–100
    consistencyScore: number;      // 0–100
    weakAreas: string[];
    feedback: string;
    aiAnalysis?: Record<string, unknown>;
}

// ─── Keyword Lists ────────────────────────────────────────────────────────────

const FINANCIAL_POSITIVE_KEYWORDS = [
    "bank statement", "sponsor", "savings", "scholarship",
    "funded", "loan", "financial support", "account balance",
];

const STUDY_INTENT_KEYWORDS = [
    "university", "course", "degree", "program", "research",
    "academic", "study", "major", "graduate", "bachelor",
];

const RETURN_INTENT_KEYWORDS = [
    "return", "family", "job", "career", "home country",
    "business", "parents", "after graduation", "come back",
];

const HESITATION_PATTERNS = [
    /\bum+\b/gi, /\buh+\b/gi, /\ber+\b/gi, /\bahh?\b/gi, /\.{3,}/g, /\blike\b/gi,
];

// ─── Scoring Engine ───────────────────────────────────────────────────────────

export class ScoringEngine {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    /**
     * Main entry point — score a completed interview session.
     */
    async score(transcripts: TranscriptEntry[]): Promise<ScoreResult> {
        const studentResponses = transcripts
            .filter((t) => t.speaker === "STUDENT")
            .map((t) => t.text)
            .join(" ");

        if (!studentResponses.trim()) {
            return this.emptyScore("No student responses recorded.");
        }

        // ── Rule-based scoring (fast, no API) ────────────────────────────────────
        const financialCredibility = this.scoreFinancialCredibility(studentResponses);
        const studyIntent = this.scoreStudyIntent(studentResponses);
        const returnIntent = this.scoreReturnIntent(studentResponses);
        const confidenceScore = this.scoreConfidence(transcripts);
        const consistencyScore = this.scoreConsistency(transcripts);

        // ── AI-enhanced analysis (semantic depth) ────────────────────────────────
        let aiAnalysis: Record<string, unknown> | undefined;
        try {
            aiAnalysis = await this.openAIAnalysis(transcripts);
        } catch (err) {
            console.warn("[Scoring] OpenAI analysis failed, using rule-based only:", err);
        }

        // ── Weighted overall score ────────────────────────────────────────────────
        const overallScore = Math.round(
            financialCredibility * 0.25 +
            studyIntent * 0.25 +
            returnIntent * 0.20 +
            confidenceScore * 0.15 +
            consistencyScore * 0.15
        );

        // ── Risk level ───────────────────────────────────────────────────────────
        const riskLevel = this.getRiskLevel(overallScore);

        // ── Weak areas ───────────────────────────────────────────────────────────
        const weakAreas = this.getWeakAreas({
            financialCredibility,
            studyIntent,
            returnIntent,
            confidenceScore,
            consistencyScore,
        });

        // ── Feedback summary ─────────────────────────────────────────────────────
        const feedback = this.buildFeedback(weakAreas, overallScore);

        return {
            overallScore,
            riskLevel,
            financialCredibility,
            studyIntent,
            returnIntent,
            confidenceScore,
            consistencyScore,
            weakAreas,
            feedback,
            aiAnalysis,
        };
    }

    // ── Dimension Scorers ───────────────────────────────────────────────────────

    private scoreFinancialCredibility(text: string): number {
        const lower = text.toLowerCase();
        const matches = FINANCIAL_POSITIVE_KEYWORDS.filter((kw) =>
            lower.includes(kw)
        ).length;
        // Max realistic matches ≈ 5
        return Math.min(100, Math.round((matches / 5) * 100));
    }

    private scoreStudyIntent(text: string): number {
        const lower = text.toLowerCase();
        const matches = STUDY_INTENT_KEYWORDS.filter((kw) =>
            lower.includes(kw)
        ).length;
        return Math.min(100, Math.round((matches / 5) * 100));
    }

    private scoreReturnIntent(text: string): number {
        const lower = text.toLowerCase();
        const matches = RETURN_INTENT_KEYWORDS.filter((kw) =>
            lower.includes(kw)
        ).length;
        return Math.min(100, Math.round((matches / 4) * 100));
    }

    private scoreConfidence(transcripts: TranscriptEntry[]): number {
        const studentTexts = transcripts
            .filter((t) => t.speaker === "STUDENT")
            .map((t) => t.text);

        if (studentTexts.length === 0) return 0;

        let totalHesitations = 0;
        let totalWords = 0;

        studentTexts.forEach((text) => {
            totalWords += text.split(/\s+/).length;
            HESITATION_PATTERNS.forEach((pattern) => {
                const matches = text.match(new RegExp(pattern.source, pattern.flags));
                totalHesitations += matches?.length ?? 0;
            });
        });

        const hesitationRate = totalWords > 0 ? totalHesitations / totalWords : 0;
        // 0 hesitations = 100, 30%+ hesitation rate = 0
        return Math.max(0, Math.round((1 - hesitationRate * 3.33) * 100));
    }

    private scoreConsistency(transcripts: TranscriptEntry[]): number {
        const studentTexts = transcripts
            .filter((t) => t.speaker === "STUDENT")
            .map((t) => t.text.toLowerCase());

        if (studentTexts.length < 2) return 70; // Default for very short sessions

        // Simple contradiction detection: check if key facts change
        const names = new Set<string>();
        const univs = new Set<string>();

        studentTexts.forEach((text) => {
            // Extract any quoted or capitalized entities (simplified)
            const words = text.split(/\s+/);
            words.forEach((word) => {
                if (word.length > 5 && /university|college|institute/i.test(word)) {
                    univs.add(word);
                }
            });
        });

        // More unique institutions mentioned → potentially inconsistent
        const inconsistencyPenalty = Math.max(0, (univs.size - 1) * 10);
        return Math.max(0, 100 - inconsistencyPenalty);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private getRiskLevel(score: number): "LOW" | "MODERATE" | "HIGH" {
        if (score >= 70) return "LOW";
        if (score >= 45) return "MODERATE";
        return "HIGH";
    }

    private getWeakAreas(scores: {
        financialCredibility: number;
        studyIntent: number;
        returnIntent: number;
        confidenceScore: number;
        consistencyScore: number;
    }): string[] {
        const weak: string[] = [];
        if (scores.financialCredibility < 60) weak.push("financial_credibility");
        if (scores.studyIntent < 60) weak.push("study_intent");
        if (scores.returnIntent < 60) weak.push("return_intent");
        if (scores.confidenceScore < 60) weak.push("confidence");
        if (scores.consistencyScore < 60) weak.push("consistency");
        return weak;
    }

    private buildFeedback(weakAreas: string[], score: number): string {
        if (score >= 80) {
            return "Excellent performance! Your responses demonstrate strong visa approval potential.";
        }
        const areaLabels: Record<string, string> = {
            financial_credibility: "financial documentation clarity",
            study_intent: "academic purpose articulation",
            return_intent: "home country ties and return intent",
            confidence: "speech confidence and fluency",
            consistency: "answer consistency across questions",
        };
        const areas = weakAreas.map((a) => areaLabels[a] ?? a).join(", ");
        return `To improve your chances, focus on: ${areas}. Practice will strengthen these areas significantly.`;
    }

    private emptyScore(feedback: string): ScoreResult {
        return {
            overallScore: 0,
            riskLevel: "HIGH",
            financialCredibility: 0,
            studyIntent: 0,
            returnIntent: 0,
            confidenceScore: 0,
            consistencyScore: 0,
            weakAreas: ["financial_credibility", "study_intent", "return_intent", "confidence"],
            feedback,
        };
    }

    /**
     * OpenAI semantic analysis for deeper scoring insights
     */
    private async openAIAnalysis(
        transcripts: TranscriptEntry[]
    ): Promise<Record<string, unknown>> {
        const conversation = transcripts
            .map((t) => `${t.speaker === "AI" ? "OFFICER" : "STUDENT"}: ${t.text}`)
            .join("\n");

        const response = await this.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an expert visa interview evaluator. Analyze this interview transcript and provide a JSON score breakdown with keys: financialCredibility (0-100), studyIntent (0-100), returnIntent (0-100), confidence (0-100), consistency (0-100), keyIssues (array of strings), strengths (array of strings). Respond ONLY with valid JSON.`,
                },
                {
                    role: "user",
                    content: conversation,
                },
            ],
            response_format: { type: "json_object" },
            max_tokens: 500,
        });

        const content = response.choices[0]?.message?.content ?? "{}";
        return JSON.parse(content) as Record<string, unknown>;
    }
}

// Export singleton
export const scoringEngine = new ScoringEngine();
