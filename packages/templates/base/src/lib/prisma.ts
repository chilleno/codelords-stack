import { PrismaClient } from "@prisma/client";

// Function to create a Prisma client dynamically
export const getPrismaClient = async () => {
    // Construct the connection string dynamically
    const DATABASE_URL = process.env.DATABASE_URL;

    return new PrismaClient({
        datasources: {
            db: {
                url: DATABASE_URL,
            },
        },
    });
}