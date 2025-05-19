import fs from "fs";
const { PG_USER, PG_PASSWORD, PG_HOST, PG_DB, PG_PORT = "5432", } = process.env;
if (!PG_USER || !PG_PASSWORD || !PG_HOST || !PG_DB) {
    console.error("❌ Missing one or more required env vars: PG_USER, PG_PASSWORD, PG_HOST, PG_DB");
    process.exit(1);
}
const encodedUser = encodeURIComponent(PG_USER);
const encodedPassword = encodeURIComponent(PG_PASSWORD);
const url = `postgresql://${encodedUser}:${encodedPassword}@${PG_HOST}:${PG_PORT}/${PG_DB}?sslmode=require`;
console.log("✅ Generated DATABASE_URL:");
console.log(url);
// Optional: write to .env for Prisma CLI
if (process.argv.includes("--write")) {
    const content = `DATABASE_URL="${url}"\n`;
    fs.writeFileSync(".env", content);
    console.log("📝 Wrote DATABASE_URL to .env");
}
