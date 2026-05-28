// Lihtne migratsiooni-runner: rakendab kõik supabase/migrations/*.sql failid
// järjekorras Postgres'i (POSTGRES_URL_NON_POOLING) vastu.
import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "..", "supabase", "migrations");

const rawConnectionString =
  process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

if (!rawConnectionString) {
  console.error("❌ POSTGRES_URL_NON_POOLING puudub .env.local failis");
  process.exit(1);
}

// Eemalda sslmode query-param, et eksplitsiitne ssl-seade kehtiks
// (Supabase kasutab self-signed sertifikaate ühenduse ahelas).
const url = new URL(rawConnectionString);
url.searchParams.delete("sslmode");
const connectionString = url.toString();

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  const files = (await readdir(migrationsDir))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = await readFile(join(migrationsDir, file), "utf8");
    process.stdout.write(`▶ Rakendan ${file} ... `);
    await client.query(sql);
    console.log("✓");
  }

  console.log(`\n✅ Kõik migratsioonid rakendatud (${files.length} faili).`);
}

run()
  .catch((err) => {
    console.error("\n❌ Migratsioon ebaõnnestus:\n", err.message);
    process.exitCode = 1;
  })
  .finally(() => client.end());
