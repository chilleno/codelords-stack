import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getPrismaClient } from "@/lib/prisma";

// =============================================================================
// BETTER AUTH SERVER CONFIGURATION
// =============================================================================
// This is the server-side auth configuration.
// For client-side auth (signIn, signUp, signOut, useSession), use auth-client.ts
// =============================================================================

// =============================================================================
// ROLE CUSTOMIZATION
// =============================================================================
// To add/remove roles:
// 1. Update the `type` array below with your role values
// 2. Update prisma/schema.prisma: role String @default("your-default")
// 3. Run: npx prisma generate && npx prisma db push
// =============================================================================

const prisma = await getPrismaClient();

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "user",
                input: false, // Users cannot set their own role during signup
            },
        },
    },
});

// Type exports for use in other files
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;