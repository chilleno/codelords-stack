'use client'

import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function LogoutButton() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleLogout = async () => {
        setIsLoading(true)
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/login")
                },
            },
        })
    }

    return (
        <button
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            onClick={handleLogout}
            disabled={isLoading}
        >
            {isLoading ? "Logging out..." : "Logout"}
        </button>
    )
}
