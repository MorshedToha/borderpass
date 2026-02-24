/**
 * src/app/api/interview/[id]/transcript/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/interview/[id]/transcript
 * Save a transcript entry to DB (called from client during live session)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
    speaker: z.enum(["STUDENT", "AI"]),
    text: z.string().min(1),
    timestamp: z.number(),           // seconds from session start
    confidence: z.number().optional(),
    isFinal: z.boolean().default(true),
});

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Verify session ownership
    const interviewSession = await prisma.interviewSession.findUnique({
        where: { id: params.id },
    });
    if (!interviewSession || interviewSession.userId !== session.user.id) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const transcript = await prisma.transcript.create({
        data: {
            sessionId: params.id,
            speaker: parsed.data.speaker,
            text: parsed.data.text,
            timestamp: parsed.data.timestamp,
            confidence: parsed.data.confidence,
            isFinal: parsed.data.isFinal,
        },
    });

    return NextResponse.json({ transcript }, { status: 201 });
}
