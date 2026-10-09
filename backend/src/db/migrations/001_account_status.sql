-- ============================================================
-- Migración 001: account_status en users (HU-17, HU-18, HU-19)
-- ------------------------------------------------------------
-- Reemplaza el rol que hoy cumple is_active en el login: en vez
-- de un booleano, distingue POR QUÉ un usuario no puede operar.
-- is_active se conserva por ahora (provider.controller.js aún lo
-- usa) y se retira cuando implementemos HU-16/17/18 completas.
-- ============================================================

CREATE TYPE account_status AS ENUM ('activo', 'inactivo_baja', 'bloqueado');

ALTER TABLE users
    ADD COLUMN account_status account_status NOT NULL DEFAULT 'activo';

-- Todo usuario existente hoy queda 'activo' por el DEFAULT de arriba;
-- no hace falta un UPDATE manual.