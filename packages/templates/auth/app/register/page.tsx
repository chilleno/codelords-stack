import { RegisterForm } from "./components/register-form";
import { auth } from "@/lib/auth"
import { headers } from "next/headers";
import { redirect } from 'next/navigation';

export default async function RegisterPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session) return redirect("/")

    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <RegisterForm />
            </div>
        </div>
    )
}
