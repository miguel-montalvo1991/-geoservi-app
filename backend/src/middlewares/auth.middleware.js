// backend/src/middlewares/auth.middleware.js
//
// login (auth.controller.js) ya genera el JWT, pero hasta ahora nada
// lo verificaba en las rutas siguientes. Sin este archivo, cualquier
// endpoint que dependa de "quién soy" (provider_profiles, offers,
// panel admin...) no tiene forma de saberlo.

import jwt from "jsonwebtoken";

// Exige un JWT válido en el header:  Authorization: Bearer <token>
// Si es válido, deja el payload ({ id, email, role }) en req.user.
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.slice("Bearer ".length);

   try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    console.error("Fallo de verificación de JWT:", error.message);
    // No distinguimos "expirado" de "inválido" en el mensaje: igual que
    // en login, no le damos al cliente pistas de más sobre por qué falló.
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}

// Factory de guard por rol. Debe ir SIEMPRE después de requireAuth
// en la cadena de middlewares, porque depende de req.user ya existente.
//
// Uso:  router.post("/me", requireAuth, requireRole("prestador"), createProfile)
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "No tienes permiso para realizar esta acción" });
    }
    next();
  };
}