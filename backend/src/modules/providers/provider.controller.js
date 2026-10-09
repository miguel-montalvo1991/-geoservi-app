import { z } from "zod";
import { pool } from "../../config/db.js";

// ------------------------------------------------------------
// Esquemas de validación con Zod
// ------------------------------------------------------------

// Mismos límites que ya viven como CHECK en schema.sql (lat/lng/radio).
// Repetirlos aquí no es redundancia inútil: así el error se ve claro
// y en español ANTES de llegar a Postgres, en vez de un 500 crudo.
const createProfileSchema = z.object({
  oficio: z.string().min(2).max(80),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  coverage_radius_km: z.number().positive().max(50).optional(),
});

// PATCH acepta los mismos campos, todos opcionales — pero OJO:
// 'status', 'approved_by' y 'approved_at' NO están aquí a propósito.
// Esos tres son exclusivos del panel admin (HU-10). Un prestador
// jamás debe poder autoaprobarse desde este endpoint.
const updateProfileSchema = createProfileSchema.partial();

const PROFILE_FIELDS =
  "user_id, oficio, status, lat, lng, coverage_radius_km, avg_rating, approved_at, created_at";

// ------------------------------------------------------------
// POST /providers/me — crear el perfil de prestador propio
// ------------------------------------------------------------
export async function createProfile(req, res, next) {
  try {
    const parsed = createProfileSchema.parse(req.body);
    const userId = req.user.id;

    const existing = await pool.query(
      "SELECT user_id FROM provider_profiles WHERE user_id = $1",
      [userId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        message: "Ya tienes un perfil de prestador. Usa PATCH /providers/me para editarlo.",
      });
    }

    const result = await pool.query(
      `INSERT INTO provider_profiles (user_id, oficio, lat, lng, coverage_radius_km)
       VALUES ($1, $2, $3, $4, COALESCE($5, 3.0))
       RETURNING ${PROFILE_FIELDS}`,
      [userId, parsed.oficio, parsed.lat, parsed.lng, parsed.coverage_radius_km]
    );

    return res.status(201).json({
      profile: result.rows[0],
      note: "Perfil creado con estado 'pendiente'. Un administrador debe aprobarlo antes de que puedas enviar ofertas (RN-12).",
    });
  } catch (error) {
    next(error);
  }
}

// ------------------------------------------------------------
// GET /providers/me — ver el perfil propio
// ------------------------------------------------------------
export async function getMyProfile(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT ${PROFILE_FIELDS} FROM provider_profiles WHERE user_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Aún no has creado tu perfil de prestador" });
    }

    return res.json({ profile: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

// ------------------------------------------------------------
// PATCH /providers/me — actualizar campos propios del perfil
// ------------------------------------------------------------
export async function updateMyProfile(req, res, next) {
  try {
    const parsed = updateProfileSchema.parse(req.body);
    const userId = req.user.id;

    if (Object.keys(parsed).length === 0) {
      return res.status(400).json({ message: "No enviaste ningún campo para actualizar" });
    }

    const fields = Object.keys(parsed);
    const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(", ");
    const values = fields.map((field) => parsed[field]);

    const result = await pool.query(
      `UPDATE provider_profiles SET ${setClause} WHERE user_id = $1
       RETURNING ${PROFILE_FIELDS}`,
      [userId, ...values]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Aún no has creado tu perfil de prestador" });
    }

    return res.json({ profile: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

// ------------------------------------------------------------
// GET /providers/:id — ver el perfil PÚBLICO de otro prestador
// (Práctica 5: enmascaramiento condicional por rol)
//
// La ubicación exacta (lat/lng) es un dato sensible: solo el dueño
// del perfil o un administrador deberían verla tal cual. Cualquier
// otro visor (ej. un cliente buscando prestadores) ve una ubicación
// aproximada, redondeada a ~1km, suficiente para saber "está cerca"
// sin exponer la posición exacta del prestador.
// ------------------------------------------------------------
function maskLocation(lat, lng) {
  return {
    lat: Number(Number(lat).toFixed(2)),
    lng: Number(Number(lng).toFixed(2)),
  };
}

export async function getProviderById(req, res, next) {
  try {
    const { id } = req.params;
    const viewerId = req.user.id;
    const viewerRole = req.user.role;

    const result = await pool.query(
      `SELECT ${PROFILE_FIELDS} FROM provider_profiles WHERE user_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Prestador no encontrado" });
    }

    const profile = result.rows[0];
    const isOwner = String(viewerId) === String(profile.user_id);
    const isAdmin = viewerRole === "administrador";

    if (isOwner || isAdmin) {
      return res.json({ profile });
    }

    const { lat, lng, ...safeFields } = profile;
    return res.json({
      profile: {
        ...safeFields,
        ...maskLocation(lat, lng),
        location_precision: "approximate",
      },
    });
  } catch (error) {
    next(error);
  }
}

// ------------------------------------------------------------
// PATCH /providers/:id/status — activar/desactivar un prestador
// (Práctica 6: gestión administrativa de usuarios)
//
// Solo administrador. Actúa sobre users.is_active — el mismo campo
// que auth.controller.js ya revisa en login(); desactivar aquí
// bloquea el acceso del prestador de inmediato en su próximo login
// (el token ya emitido sigue viviendo hasta que expire, eso es
// una limitación conocida de JWT sin lista de revocación).
// ------------------------------------------------------------
const updateStatusSchema = z.object({
  is_active: z.boolean(),
});

export async function updateProviderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const parsed = updateStatusSchema.parse(req.body);

    const result = await pool.query(
      `UPDATE users SET is_active = $1
       WHERE id = $2 AND role = 'prestador'
       RETURNING id, name, email, role, is_active`,
      [parsed.is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Prestador no encontrado" });
    }

    return res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

// ------------------------------------------------------------
// GET /providers/search — búsqueda por radio de cercanía (HU-03)
// Fórmula de Haversine calculada en SQL crudo (ver ADR-001):
// necesitamos control total sobre esta consulta para cumplir el
// requisito no funcional de <2s en un radio de 5km.
// ------------------------------------------------------------
const searchSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  oficio: z.string().min(2).max(80),
  radius_km: z.coerce.number().positive().max(50).default(5),
});

export async function searchProviders(req, res, next) {
  try {
    // req.query llega como strings — z.coerce convierte antes de validar
    const parsed = searchSchema.parse(req.query);

    const result = await pool.query(
      `SELECT
         pp.user_id, pp.oficio, pp.avg_rating, pp.coverage_radius_km,
         6371 * acos(
           cos(radians($1)) * cos(radians(pp.lat)) * cos(radians($2) - radians(pp.lng))
           + sin(radians($1)) * sin(radians(pp.lat))
         ) AS distance_km
       FROM provider_profiles pp
       JOIN users u ON u.id = pp.user_id
       WHERE pp.status = 'aprobado'
         AND u.account_status = 'activo'
         AND pp.oficio = $3
       HAVING 6371 * acos(
           cos(radians($1)) * cos(radians(pp.lat)) * cos(radians($2) - radians(pp.lng))
           + sin(radians($1)) * sin(radians(pp.lat))
         ) <= LEAST($4, pp.coverage_radius_km)
       ORDER BY distance_km ASC`,
      [parsed.lat, parsed.lng, parsed.oficio, parsed.radius_km]
    );

    return res.json({
      count: result.rows.length,
      providers: result.rows,
    });
  } catch (error) {
    next(error);
  }
}
