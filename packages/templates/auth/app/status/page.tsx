import { getPrismaClient } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logout } from "@/util/logout";
import { Suspense } from "react";

export default async function StatusPage() {
  let dbStatus = "unknown";
  const session = await auth();

  try {
    const prisma = await getPrismaClient();
    await prisma.$connect();
    dbStatus = "connected ✅";
    await prisma.$disconnect();
  } catch (error) {
    dbStatus = "not connected ❌";
    console.error("❌ Prisma connection error:", error);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-3xl font-bold mb-4">🛠️ Codelords Stack Status</h1>
      <p className="text-xl">
        <strong>Database:</strong> {dbStatus}
      </p>
      <p className="text-lg mt-2">
        <strong>Session:</strong> {session ? "Active ✅" : "No active session ❌"}
        <br />
        {session && `User: ${session.user.email}`}
        <br />
        <Suspense>
          {session ? (
            <button
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={logout}
            >
              Logout
            </button>
          )
            : (
              <a
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                href="/login"
              >
                Login
              </a>
            )
          }
        </Suspense>
      </p>
    </div>
  );
}