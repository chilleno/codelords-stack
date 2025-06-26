// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
            name: string
            email: string
        }
    }
    interface User {
        id: string
        role: string
        name: string
        email: string
    }
}