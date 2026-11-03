import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { pool } from "../../config/db.js";
import { OAuth2Client } from "google-auth-library";

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

    // Mensaje genérico si el usuario no existe, está desactivado o no tiene
    // contraseña (cuentas que entran solo con Google).
    // Esto evita que un atacante pueda enumerar qué correos existen
    // en el sistema (mismo patrón que la guía de la Clase 04).
    if (!user || !user.is_active || !user.password_hash) {
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

// ------------------------------------------------------------
// Inicio de sesión con Google
// ------------------------------------------------------------

const googleSchema = z.object({
  credential: z.string().min(10),
  role: z.enum(["cliente", "prestador"]).optional(),
});

let googleClient;
function getGoogleClient() {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("Falta GOOGLE_CLIENT_ID en backend/.env");
  }
  googleClient ??= new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  return googleClient;
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

// ------------------------------------------------------------
// POST /auth/google
// ------------------------------------------------------------
export async function googleAuth(req, res, next) {
  try {
    const { credential, role } = googleSchema.parse(req.body);

    // 1. Verificar el token con Google
    let payload;
    try {
      const ticket = await getGoogleClient().verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      console.error("Fallo al verificar token de Google:", err.message);
      return res.status(401).json({ message: "No se pudo verificar la cuenta de Google" });
    }

    // 2. Google debe haber confirmado que el correo es de esa persona
    if (!payload?.email || !payload.email_verified) {
      return res.status(401).json({ message: "Tu correo de Google no está verificado" });
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();

    // 3. Buscar al usuario por google_id o, si no, por correo
    const found = await pool.query(
      `SELECT id, name, email, role, is_active, google_id
         FROM users
        WHERE google_id = $1 OR lower(email) = $2
        ORDER BY (google_id = $1) DESC NULLS LAST
        LIMIT 1`,
      [googleId, email]
    );
    let user = found.rows[0];
    let isNew = false;

    if (user) {
      // Caso A: el usuario ya existe
      if (!user.is_active) {
        return res.status(401).json({ message: "Credenciales invalidas" });
      }
      if (user.google_id && user.google_id !== googleId) {
        // Ese correo ya está enlazado a OTRA cuenta de Google
        return res.status(401).json({ message: "Credenciales invalidas" });
      }
      if (!user.google_id) {
        // Se registró con contraseña: lo enlazamos a Google
        await pool.query("UPDATE users SET google_id = $1 WHERE id = $2", [googleId, user.id]);
      }
    } else {
      // Caso B: no existe. Solo se crea si llegó un rol (pantalla "Crear cuenta")
      if (!role) {
        return res.status(404).json({
          message: "No existe una cuenta con ese correo. Primero regístrate.",
        });
      }
      const name = (payload.name || email.split("@")[0]).slice(0, 120);
      const created = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, google_id)
         VALUES ($1, $2, NULL, $3, $4)
         RETURNING id, name, email, role`,
        [name, email, role, googleId]
      );
      user = created.rows[0];
      isNew = true;
    }

    // 4. Misma respuesta que el login normal
    return res.json({
      token: signToken(user),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      note:
        isNew && role === "prestador"
          ? "Registro creado. Debes completar tu perfil de prestador para poder ofertar servicios."
          : undefined,
    });
  } catch (error) {
    next(error);
  }
}