import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { encryptPassword } from "@/util/password";

export async function POST(req: Request) {
    //Validate user permissions only admins can create profiles
    const prisma = getPrismaClient();
    const { name, password, email } = await req.json(); // Parse form data

    // ✅ Validate required fields
    if (!name || !password || !email) {
        return NextResponse.json({ message: "All the fields are required." }, { status: 208 });
    }

    try {
        // ✅ Insert profile into the database
        const newUser = await (await prisma).user.create({
            data: { name, email, password: encryptPassword(password), role: "USER", createdAt: new Date(), updatedAt: new Date() },
        });

        return NextResponse.json({ success: true, userId: newUser.id }, { status: 201 });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return NextResponse.json({ message: "Email already used." }, { status: 208 });
            }
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}