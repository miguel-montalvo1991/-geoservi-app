// Ejecuta los archivos .sql que le pases, en orden, contra DATABASE_URL
import "dotenv/config";
import pg from "pg";
import fs from "node:fs";

const archivos = process.argv.slice(2);

if (archivos.length === 0) {
  console.error("Indica al menos un archivo .sql");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

try {
  for (const archivo of archivos) {
    await pool.query(fs.readFileSync(archivo, "utf8"));
    console.log(`Ejecutado: ${archivo}`);
  }
} catch (e) {
  console.error("Error:", e.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}