/**
 * src/app/layout.tsx
 * Root application layout for Next.js 14 App Router
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: {
        default: "BOrderpass — AI Visa Interview Simulator",
        template: "%s | BOrderpass",
    },
    description:
        "Practice your visa interview with a real-time AI voice interviewer. Get scored, identify weak areas, and walk into your visa office with confidence.",
    keywords: ["visa interview", "AI simulator", "student visa", "F1 visa", "UK visa", "IELTS"],
    openGraph: {
        title: "BOrderpass — AI Visa Interview Simulator",
        description: "Practice visa interviews with AI. Get scored instantly.",
        type: "website",
        url: "https://www.borderpass.ai",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="antialiased bg-gray-950 text-white">
                {children}
            </body>
        </html>
    );
}
