// scripts/test-db.ts
import { getPrisma } from "../src/lib/prisma.js";

async function main() {
  try {
    const prisma = await getPrisma();

    const dbUrl = process.env.PG_HOST;
    console.log("🔗 Connecting to database at:", dbUrl);

    // Replace this with a known table or model if defined
    const now = await prisma.$queryRawUnsafe<{ now: string }[]>("SELECT NOW()");
    console.log("✅ Connected to DB. Server time:", now[0].now);

    await prisma.$disconnect();
  } catch (err) {
    console.error("❌ Failed to connect to DB:", err);
    process.exit(1);
  }
}

main();
