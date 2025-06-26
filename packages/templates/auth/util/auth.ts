import { getPrismaClient } from "@/lib/prisma";
import { verifyPassword } from "@/util/password";

export const getUserFromDb = async (email: string, password: string) => {
    const prisma = getPrismaClient();
    try {
        // get user from db
        const user = await (await prisma).user.findUnique({
            select:{
                id: true,
                name: true,
                email: true,
                password: true,
                role: true,
            },
            where: {
                email: email,
            },
        });

        if (verifyPassword(password, user?.password as string)) {
            return {
                id: user?.id.toString() as string,
                name: user?.name as string,
                email: user?.email as string,
                role: user?.role as string,
            }
        } else {
            // password does not match
            return null;
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}
