import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { pool } from "../../config/db.js";

// ------------------------------------------------------------
// Esquemas de validación con Zod
// ------------------------------------------------------------

// Reglas para el registro: el rol solo puede ser 'cliente' o 'prestador'.
// 'administrador' queda fuera a propósito: nadie debe poder
// autoasignarse ese rol desde un formulario público.
const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["cliente", "prestador"]),
});

// Reglas para el login: solo necesitamos validar formato,
// no la existencia real del usuario (eso se revisa después).
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// ------------------------------------------------------------
// POST /auth/register
// ------------------------------------------------------------
export async function register(req, res, next) {
  try {
    // 1. Validamos el body con Zod. Si falla, lanza ZodError
    //    automáticamente y cae al catch -> next(error) -> errorHandler.
    const parsed = registerSchema.parse(req.body);

    // 2. Verificamos que el email no esté ya registrado.
    //    (La tabla ya tiene UNIQUE en email, pero validamos antes
    //    para devolver un mensaje claro en vez de un error crudo de PostgreSQL)
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [parsed.email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }

    // 3. Nunca guardamos la contraseña en texto plano: la hasheamos.
    //    10 es el "cost factor" de bcrypt: suficiente para desarrollo/proyecto de grado.
    const passwordHash = await bcrypt.hash(parsed.password, 10);

    // 4. Insertamos el usuario. gen_random_uuid() y default de is_active
    //    ya están definidos en el schema, no hace falta pasarlos aquí.
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [parsed.name, parsed.email, passwordHash, parsed.role]
    );

    const newUser = result.rows[0];

    // 5. Si el rol es 'prestador', devolvemos un aviso adicional:
    //    su perfil profesional (oficio, ubicación) aún no existe,
    //    eso se completa en otro endpoint más adelante.
    return res.status(201).json({
      user: newUser,
      note:
        parsed.role === "prestador"
          ? "Registro creado. Debes completar tu perfil de prestador para poder ofertar servicios."
          : undefined,
    });
  } catch (error) {
    // Cualquier error (ZodError, error de PostgreSQL, etc.) se delega
    // al errorHandler centralizado, igual que en la guía.
    next(error);
  }
}

// ------------------------------------------------------------
// POST /auth/login
// ------------------------------------------------------------
export async function login(req, res, next) {
  try {
    const parsed = loginSchema.parse(req.body);

    // Buscamos el usuario por email.
    const result = await pool.query(
      "SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = $1",
      [parsed.email]
    );
    const user = result.rows[0];

    // Mensaje genérico si el usuario no existe O si está desactivado.
    // Esto evita que un atacante pueda enumerar qué correos existen
    // en el sistema (mismo patrón que la guía de la Clase 04).
    if (!user || !user.is_active) {
      return res.status(401).json({ message: "Credenciales invalidas" });
    }

    // Comparamos la contraseña recibida contra el hash guardado.
    const valid = await bcrypt.compare(parsed.password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Credenciales invalidas" });
    }

    // Generamos el token JWT con los datos mínimos necesarios
    // para identificar al usuario en rutas protegidas futuras.
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}