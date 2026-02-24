/**
 * src/app/api/interview/[id]/score/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/interview/[id]/score
 *   Triggers scoring engine on completed session transcripts
 *   Persists score to DB
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { scoringEngine } from "@/services/scoring.service";
import type { TranscriptEntry } from "@/services/scoring.service";

export async function POST(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: sessionId } = params;

        // ── Fetch session & transcripts ──────────────────────────────────────────

        const interviewSession = await prisma.interviewSession.findUnique({
            where: { id: sessionId },
            include: { transcripts: { orderBy: { timestamp: "asc" } } },
        });

        if (!interviewSession || interviewSession.userId !== session.user.id) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        if (interviewSession.score) {
            // Already scored
            return NextResponse.json({ score: interviewSession.score });
        }

        // ── Run scoring engine ───────────────────────────────────────────────────

        const transcriptEntries: TranscriptEntry[] = interviewSession.transcripts.map((t) => ({
            speaker: t.speaker,
            text: t.text,
            timestamp: t.timestamp,
        }));

        const result = await scoringEngine.score(transcriptEntries);

        // ── Persist score ────────────────────────────────────────────────────────

        const score = await prisma.score.create({
            data: {
                sessionId,
                userId: session.user.id,
                overallScore: result.overallScore,
                riskLevel: result.riskLevel,
                financialCredibility: result.financialCredibility,
                studyIntent: result.studyIntent,
                returnIntent: result.returnIntent,
                confidenceScore: result.confidenceScore,
                consistencyScore: result.consistencyScore,
                weakAreas: result.weakAreas,
                feedback: result.feedback,
                aiAnalysis: result.aiAnalysis ?? {},
            },
        });

        // Mark session as completed
        await prisma.interviewSession.update({
            where: { id: sessionId },
            data: { status: "COMPLETED", endedAt: new Date() },
        });

        return NextResponse.json({ score });
    } catch (err) {
        console.error("[API] POST /api/interview/[id]/score error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
