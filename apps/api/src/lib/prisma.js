import { PrismaClient } from "@prisma/client";
import { DefaultAzureCredential } from "@azure/identity";
const DB_MODE = process.env.DB_MODE || "local"; // "local", "local-cloud", "cloud"
let prisma;
async function createPrismaClient() {
    let url;
    switch (DB_MODE) {
        case "cloud": {
            const credential = new DefaultAzureCredential();
            const token = await credential.getToken("https://ossrdbms-aad.database.windows.net/.default");
            const host = process.env.PG_HOST;
            const db = process.env.PG_DB;
            const clientId = process.env.AZURE_CLIENT_ID;
            const tenantId = process.env.AZURE_TENANT_ID;
            const aadUser = `${clientId}@${tenantId}`;
            url = `postgresql://${encodeURIComponent(aadUser)}:${encodeURIComponent(token.token)}@${host}/${db}?sslmode=require`;
            break;
        }
        case "local-cloud": {
            const host = process.env.PG_HOST;
            const db = process.env.PG_DB;
            const user = process.env.PG_USER;
            const password = process.env.PG_PASSWORD;
            url = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}/${db}?sslmode=require`;
            console.log("Using local-cloud database connection: ", url);
            break;
        }
        case "local":
        default: {
            const host = process.env.PG_HOST || "localhost";
            const db = process.env.PG_DB || "postgres";
            const user = process.env.PG_USER || "postgres";
            const password = process.env.PG_PASSWORD || "postgres";
            const port = process.env.PG_PORT || "5432";
            url = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${db}`;
            break;
        }
    }
    return new PrismaClient({
        datasources: {
            db: {
                url,
            },
        },
    });
}
export async function getPrisma() {
    if (!prisma) {
        prisma = await createPrismaClient();
    }
    return prisma;
}
