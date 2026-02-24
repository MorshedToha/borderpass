/**
 * src/app/api/auth/register/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/auth/register
 * Create a new user account with hashed password
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
    name: z.string().min(2).max(60),
    email: z.string().email(),
    password: z.string().min(8).max(100),
});

export async function POST(req: NextRequest) {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid input", details: parsed.error.errors },
            { status: 400 }
        );
    }

    const { name, email, password } = parsed.data;

    // Check existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return NextResponse.json(
            { error: "An account with this email already exists." },
            { status: 409 }
        );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user + FREE subscription atomically
    const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
            data: { name, email, password: hashedPassword, role: "STUDENT" },
        });
        await tx.subscription.create({
            data: {
                userId: newUser.id,
                plan: "FREE",
                status: "ACTIVE",
                interviewsUsed: 0,
                interviewsLimit: 1,
            },
        });
        return newUser;
    });

    return NextResponse.json(
        { message: "Account created successfully", userId: user.id },
        { status: 201 }
    );
}
