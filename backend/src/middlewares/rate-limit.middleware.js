import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30, 
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Demasiadas solicitudes, por favor intente nuevamente más tarde."
    }
});

