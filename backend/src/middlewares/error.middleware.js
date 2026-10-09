import { ZodError } from "zod";

// Middleware para rutas que no existen (siempre se registra antes de errorHandler en app.js)
export function notFoundHandler(req, res, next) {
    return res.status(404).json({
        message: "Ruta no encontrada"
    });
}

// Middleware central de manejo de errores (siempre el último app.use en app.js)
export function errorHandler(err, req, res, next) {
    // Log completo en la consola del servidor para depurar; esto NUNCA se envía al cliente tal cual
    console.error("[ERROR]", err);

    // 1) Errores de validación de Zod -> 400 con detalle limpio por campo
    //    (antes esto caía al genérico de abajo con status 500 y el JSON crudo del error)
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: "Error de validación",
            errors: err.issues.map((issue) => ({
                campo: issue.path.join(".") || "(raíz)",
                mensaje: issue.message,
            })),
        });
    }

    // 2) Errores controlados por tu propio código (cuando en algún controller haces
    //    throw new Error("mensaje") y le agregas manualmente err.statusCode, ej. 401/403)
    //    -> se respeta ese status y ese mensaje, porque fue escrito a propósito para el cliente
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            message: err.message,
        });
    }

    // 3) Cualquier otro error NO controlado (errores de PostgreSQL, bugs internos, etc.)
    //    -> siempre 500 genérico, SIN exponer err.message: podría traer nombres de tabla,
    //    constraints o detalles internos de la base de datos que no deben salir al cliente
    return res.status(500).json({
        message: "Error interno del servidor",
    });
}