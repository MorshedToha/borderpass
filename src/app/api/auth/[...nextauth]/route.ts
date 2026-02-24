/**
 * src/app/api/auth/[...nextauth]/route.ts
 * NextAuth v5 route handler — required for App Router
 */

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
