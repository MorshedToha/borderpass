/**
 * prisma/seed.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Database seeder — creates initial countries and sample questions
 * Run: npm run db:seed
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database…");

    // ── Countries ──────────────────────────────────────────────────────────────
    const usa = await prisma.country.upsert({
        where: { code: "USA" },
        update: {},
        create: {
            name: "United States",
            code: "USA",
            flag: "🇺🇸",
            description: "F1, B1/B2, and J1 visa interview preparation",
            isActive: true,
        },
    });

    const canada = await prisma.country.upsert({
        where: { code: "CANADA" },
        update: {},
        create: {
            name: "Canada",
            code: "CANADA",
            flag: "🇨🇦",
            description: "Study permit and visitor visa interview preparation",
            isActive: true,
        },
    });

    const uk = await prisma.country.upsert({
        where: { code: "UK" },
        update: {},
        create: {
            name: "United Kingdom",
            code: "UK",
            flag: "🇬🇧",
            description: "Standard Visitor and Student visa preparation",
            isActive: true,
        },
    });

    console.log(`✅ Countries seeded: USA, Canada, UK`);

    // ── Sample Questions (USA) ─────────────────────────────────────────────────
    const usaQuestions = [
        {
            text: "Why did you choose the United States for your studies?",
            category: "study_intent",
            difficulty: 2,
            tags: ["study_intent", "motivation"],
        },
        {
            text: "How will you finance your education and living expenses in the US?",
            category: "financial",
            difficulty: 3,
            tags: ["financial", "bank_balance", "sponsor"],
        },
        {
            text: "What are your plans after completing your degree?",
            category: "return_intent",
            difficulty: 2,
            tags: ["return_intent", "career"],
        },
        {
            text: "Do you have any relatives currently in the United States?",
            category: "ties",
            difficulty: 1,
            tags: ["ties", "family"],
        },
        {
            text: "Can you tell me about your university and the program you will study?",
            category: "study_intent",
            difficulty: 2,
            tags: ["study_intent", "university"],
        },
        {
            text: "What is your current academic background?",
            category: "study_intent",
            difficulty: 1,
            tags: ["study_intent", "academic"],
        },
        {
            text: "Who is your financial sponsor and what do they do for work?",
            category: "financial",
            difficulty: 3,
            tags: ["financial", "sponsor"],
        },
        {
            text: "Why can you not pursue this degree in your home country?",
            category: "study_intent",
            difficulty: 3,
            tags: ["study_intent", "motivation"],
        },
    ];

    for (const q of usaQuestions) {
        await prisma.question.create({
            data: { ...q, countryId: usa.id },
        });
    }

    // ── Sample Questions (Canada) ─────────────────────────────────────────────
    const canadaQuestions = [
        {
            text: "What is the name of your institution and the program you applied to?",
            category: "study_intent",
            difficulty: 1,
            tags: ["study_intent", "institution"],
        },
        {
            text: "How did you receive acceptance from this Canadian institution?",
            category: "study_intent",
            difficulty: 2,
            tags: ["study_intent", "admissions"],
        },
        {
            text: "What are your financial resources to support your stay in Canada?",
            category: "financial",
            difficulty: 3,
            tags: ["financial"],
        },
        {
            text: "Do you have strong ties to your home country that will ensure your return?",
            category: "return_intent",
            difficulty: 3,
            tags: ["return_intent", "ties"],
        },
    ];

    for (const q of canadaQuestions) {
        await prisma.question.create({
            data: { ...q, countryId: canada.id },
        });
    }

    // ── Sample Questions (UK) ─────────────────────────────────────────────────
    const ukQuestions = [
        {
            text: "What is the purpose of your visit to the United Kingdom?",
            category: "study_intent",
            difficulty: 1,
            tags: ["study_intent"],
        },
        {
            text: "How are you funding your studies and accommodation in the UK?",
            category: "financial",
            difficulty: 3,
            tags: ["financial"],
        },
        {
            text: "What do you plan to do after finishing your studies in the UK?",
            category: "return_intent",
            difficulty: 2,
            tags: ["return_intent"],
        },
    ];

    for (const q of ukQuestions) {
        await prisma.question.create({
            data: { ...q, countryId: uk.id },
        });
    }

    const totalQuestions = usaQuestions.length + canadaQuestions.length + ukQuestions.length;
    console.log(`✅ Questions seeded: ${totalQuestions} total`);
    console.log("✨ Seeding complete!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
