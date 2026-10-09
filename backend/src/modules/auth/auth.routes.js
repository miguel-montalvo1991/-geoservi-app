import { Router } from "express";
import { register, login } from "./auth.controller.js";
import { authLimiter } from "../../middlewares/rate-limit.middleware.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

// authLimiter aplica el control preventivo de fuerza bruta
// (máx. 30 peticiones en 15 min) sobre login Y registro.
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

// GET /auth/me - devuelve el usuario según el token enviado.
// Si el token es inválido o expiró, requireAuth responde 401 antes de llegar aquí,
// así que llegar a esta línea YA es la prueba de que el token es válido.
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;