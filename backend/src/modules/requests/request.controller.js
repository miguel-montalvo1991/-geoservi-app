import { z } from "zod";
import { pool } from "../../config/db.js";

const createRequestSchema = z.object({
  oficio_needed: z.string().trim().min(2).max(80),
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(5000),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const REQUEST_FIELDS =
  "id, client_id, oficio_needed, title, description, lat, lng, status, created_at";

export async function createRequest(req, res, next) {
  let client;
  try {
    const parsed = createRequestSchema.parse(req.body);
    client = await pool.connect();
    await client.query("BEGIN");
    const result = await client.query(
      `INSERT INTO service_requests
         (client_id, oficio_needed, title, description, lat, lng)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${REQUEST_FIELDS}`,
      [
        req.user.id,
        parsed.oficio_needed,
        parsed.title,
        parsed.description,
        parsed.lat,
        parsed.lng,
      ]
    );

    const request = result.rows[0];
    const notificationResult = await client.query(
      `WITH candidates AS (
         SELECT pp.user_id,
                6371 * acos(LEAST(1, GREATEST(-1,
                  cos(radians($1)) * cos(radians(pp.lat))
                  * cos(radians($2) - radians(pp.lng))
                  + sin(radians($1)) * sin(radians(pp.lat))
                ))) AS distance_km,
                pp.coverage_radius_km
         FROM provider_profiles pp
         JOIN users u ON u.id = pp.user_id
         WHERE pp.status = 'aprobado'
           AND pp.is_available = TRUE
           AND u.role = 'prestador'
           AND u.account_status = 'activo'
           AND u.is_active = TRUE
           AND pp.oficio = $3
       )
       INSERT INTO notifications
         (recipient_id, type, title, message, service_request_id)
       SELECT user_id,
              'solicitud_cercana',
              'Nueva solicitud de ' || $4,
              $5,
              $6
       FROM candidates
       WHERE distance_km <= LEAST(5, coverage_radius_km)
       ON CONFLICT (recipient_id, service_request_id, type) DO NOTHING`,
      [request.lat, request.lng, request.oficio_needed, request.oficio_needed, request.title, request.id]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      request,
      notified_providers: notificationResult.rowCount,
    });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }
    return next(error);
  } finally {
    client?.release();
  }
}

export async function getMyRequests(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT ${REQUEST_FIELDS}
       FROM service_requests
       WHERE client_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.json({ count: result.rows.length, requests: result.rows });
  } catch (error) {
    return next(error);
  }
}
