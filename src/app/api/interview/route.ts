/**
 * src/app/api/interview/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Interview Session API
 *  POST /api/interview   — Create a new interview session
 *  GET  /api/interview   — List user's sessions
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getInterviewLimit, supportsVoiceMode } from "@/services/stripe.service";
import { z } from "zod";

const createSessionSchema = z.object({
    countryId: z.string().min(1),
    mode: z.enum(["VOICE", "TEXT"]).default("VOICE"),
});

// ─── POST: Create Interview Session ──────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const parsed = createSessionSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request", details: parsed.error.errors },
                { status: 400 }
            );
        }

        const { countryId, mode } = parsed.data;
        const userId = session.user.id;

        // ── Subscription check ───────────────────────────────────────────────────

        const subscription = await prisma.subscription.findUnique({
            where: { userId },
        });

        const plan = subscription?.plan ?? "FREE";
        const limit = getInterviewLimit(plan);

        // Check voice mode eligibility
        if (mode === "VOICE" && !supportsVoiceMode(plan)) {
            return NextResponse.json(
                { error: "Voice mode requires a Pro or Premium subscription.", upgradeRequired: true },
                { status: 403 }
            );
        }

        // Check interview limit (-1 = unlimited)
        if (limit !== -1 && (subscription?.interviewsUsed ?? 0) >= limit) {
            return NextResponse.json(
                { error: "Interview limit reached for your plan.", upgradeRequired: true },
                { status: 403 }
            );
        }

        // ── Create Session ───────────────────────────────────────────────────────

        const interviewSession = await prisma.interviewSession.create({
            data: {
                userId,
                countryId,
                mode,
                status: "PENDING",
            },
            include: { country: true },
        });

        // Increment usage counter
        await prisma.subscription.upsert({
            where: { userId },
            create: { userId, plan: "FREE", interviewsUsed: 1, interviewsLimit: 1 },
            update: { interviewsUsed: { increment: 1 } },
        });

        return NextResponse.json(
            { session: interviewSession },
            { status: 201 }
        );
    } catch (err) {
        console.error("[API] POST /api/interview error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// ─── GET: List User Sessions ──────────────────────────────────────────────────

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") ?? "1");
        const limit = parseInt(searchParams.get("limit") ?? "10");

        const [sessions, total] = await Promise.all([
            prisma.interviewSession.findMany({
                where: { userId: session.user.id },
                include: { country: true, score: true },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.interviewSession.count({ where: { userId: session.user.id } }),
        ]);

        return NextResponse.json({ sessions, total, page, limit });
    } catch (err) {
        console.error("[API] GET /api/interview error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
