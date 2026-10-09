import "dotenv/config"; // cargamos la variable de entorno DATABASE_URL
import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});