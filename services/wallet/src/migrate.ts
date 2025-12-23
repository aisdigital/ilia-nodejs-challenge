import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { getConfig } from "./config";

async function ensureMigrationsTable(pool: Pool) {
	await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      run_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function runMigrations() {
	const config = getConfig();
	if (!config.databaseUrl) {
		throw new Error("WALLET_DATABASE_URL is required");
	}

	const pool = new Pool({ connectionString: config.databaseUrl });
	const migrationsDir = path.join(
		path.dirname(fileURLToPath(new URL(import.meta.url))),
		"../migrations",
	);

	try {
		await ensureMigrationsTable(pool);
		const files = (await readdir(migrationsDir))
			.filter((file) => file.endsWith(".sql"))
			.sort();

		for (const file of files) {
			const id = file;
			const alreadyRun = await pool.query(
				"SELECT 1 FROM schema_migrations WHERE id = $1",
				[id],
			);
			if (alreadyRun.rowCount) {
				continue;
			}

			const sql = await readFile(path.join(migrationsDir, file), "utf8");
			console.log(`[migrate] applying ${file}`);
			await pool.query("BEGIN");
			try {
				await pool.query(sql);
				await pool.query("INSERT INTO schema_migrations (id) VALUES ($1)", [
					id,
				]);
				await pool.query("COMMIT");
			} catch (error) {
				await pool.query("ROLLBACK");
				throw error;
			}
		}
		console.log("[migrate] done");
	} finally {
		await pool.end();
	}
}

runMigrations().catch((error) => {
	console.error("[migrate] failed", error);
	process.exit(1);
});
