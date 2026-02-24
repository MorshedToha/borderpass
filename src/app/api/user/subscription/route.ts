/**
 * src/app/api/user/subscription/route.ts
 * GET /api/user/subscription — Return current user's subscription details
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
        where: { userId: session.user.id },
    });

    return NextResponse.json({
        plan: subscription?.plan ?? "FREE",
        status: subscription?.status ?? "ACTIVE",
        interviewsUsed: subscription?.interviewsUsed ?? 0,
        interviewsLimit: subscription?.interviewsLimit ?? 1,
    });
}
