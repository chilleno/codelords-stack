import { createAuthClient } from "better-auth/react";

// =============================================================================
// BETTER AUTH CLIENT
// =============================================================================
// Use these exports in client components for authentication operations.
// For server-side session access, use auth.api.getSession() from ./auth.ts
// =============================================================================

export const authClient = createAuthClient({
    // baseURL is optional when client and server are on the same domain
    // baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

// Destructure for convenient imports
export const { signIn, signUp, signOut, useSession } = authClient;
