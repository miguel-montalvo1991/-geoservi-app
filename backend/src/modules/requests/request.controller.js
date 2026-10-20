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
  try {
    const parsed = createRequestSchema.parse(req.body);
    const result = await pool.query(
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

    return res.status(201).json({ request: result.rows[0] });
  } catch (error) {
    return next(error);
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
