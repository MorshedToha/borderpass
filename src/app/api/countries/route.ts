/**
 * src/app/api/countries/route.ts
 * GET /api/countries — Return all active countries from DB
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const countries = await prisma.country.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true, code: true, flag: true, description: true },
    });
    return NextResponse.json({ countries });
}
