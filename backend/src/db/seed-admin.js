// backend/src/db/seed-admin.js
//
// Crea el primer usuario administrador directamente en la base de datos.
// Existe porque POST /auth/register bloquea a propósito el rol 'administrador'
// (nadie debe poder autoasignárselo desde un formulario público) — así que ese
// rol solo puede nacer aquí, del lado del servidor, nunca desde la API pública.
//
// Uso:
//   1. Agrega TEMPORALMENTE a tu .env (que ya está en .gitignore):
//        ADMIN_NAME="Nombre Apellido"
//        ADMIN_EMAIL="admin@geoservi.local"
//        ADMIN_PASSWORD="unaContraseñaFuerte123"
//   2. Corre:  npm run seed:admin
//   3. Borra esas 3 líneas del .env — ya cumplieron su función y no deben
//      quedar ahí (una contraseña de admin en texto plano parada en un
//      archivo es exactamente lo que no queremos).

import "dotenv/config";
import bcrypt from "bcrypt";
import { pool } from "../config/db.js";

async function seedAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error(
      "Faltan ADMIN_NAME, ADMIN_EMAIL o ADMIN_PASSWORD en el .env. Agrégalas temporalmente y vuelve a correr el script."
    );
    process.exit(1);
  }

  // Misma regla mínima que usa registerSchema en auth.controller.js,
  // para no crear un admin con una contraseña más débil que la que
  // le exigimos a cualquier cliente o prestador.
  if (ADMIN_PASSWORD.length < 8) {
    console.error("ADMIN_PASSWORD debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  const existing = await pool.query(
    "SELECT id, role FROM users WHERE email = $1",
    [ADMIN_EMAIL]
  );

  if (existing.rows.length > 0) {
    console.error(
      `Ya existe un usuario con ese correo (rol actual: ${existing.rows[0].role}). No se creó nada, para no arriesgar un duplicado o un cambio de rol accidental.`
    );
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'administrador')
     RETURNING id, name, email, role, created_at`,
    [ADMIN_NAME, ADMIN_EMAIL, passwordHash]
  );

  console.log("Administrador creado correctamente:");
  console.log(result.rows[0]);
  console.log("\nAhora borra ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD de tu .env.");
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("Error creando el administrador:", err);
  process.exit(1);
});