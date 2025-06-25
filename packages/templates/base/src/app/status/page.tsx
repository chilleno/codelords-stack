import { getPrismaClient } from "@/lib/prisma";

export default async function StatusPage() {
  let dbStatus = "unknown";

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
    </div>
  );
}