import { z } from "zod";
import { pool } from "../../config/db.js";

const listQuerySchema = z.object({
  unread_only: z.enum(["true", "false"]).default("false"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function getMyNotifications(req, res, next) {
  try {
    const parsed = listQuerySchema.parse(req.query);
    const result = await pool.query(
      `SELECT id, type, title, message, service_request_id, read_at, created_at
       FROM notifications
       WHERE recipient_id = $1
         AND ($2::boolean = FALSE OR read_at IS NULL)
       ORDER BY created_at DESC, id DESC
       LIMIT $3`,
      [req.user.id, parsed.unread_only === "true", parsed.limit]
    );

    return res.json({ count: result.rows.length, notifications: result.rows });
  } catch (error) {
    return next(error);
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const result = await pool.query(
      `UPDATE notifications
       SET read_at = COALESCE(read_at, now())
       WHERE id = $1 AND recipient_id = $2
       RETURNING id, type, title, message, service_request_id, read_at, created_at`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }

    return res.json({ notification: result.rows[0] });
  } catch (error) {
    return next(error);
  }
}
