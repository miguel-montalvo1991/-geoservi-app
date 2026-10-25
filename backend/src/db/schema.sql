-- ============================================================
-- GeoServi-App — Esquema de base de datos (PostgreSQL)
-- Proyecto formativo SENA ADSO — Ficha 3229209
-- Versión definitiva: 9 tablas, sin ORM (pg + SQL crudo)
-- ============================================================

-- Extensión necesaria para poder generar UUIDs automáticamente
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Lista cerrada de roles válidos: solo se permiten estos 3 valores
CREATE TYPE user_role AS ENUM ('cliente', 'prestador', 'administrador');

-- ------------------------------------------------------------
-- 1. USERS — tabla central, guarda los 3 roles en una sola tabla
-- ------------------------------------------------------------
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(120) NOT NULL,
    email           VARCHAR(160) NOT NULL UNIQUE,        -- UNIQUE: PostgreSQL rechaza correos repetidos solo
    password_hash   VARCHAR(255) NOT NULL,               -- nunca se guarda la contraseña real, solo su hash
    role            user_role NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,        -- false = usuario bloqueado
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Nota: el status pendiente/aprobado/suspendido NO va aquí porque solo aplica
-- al rol prestador (HU-06/HU-11). Un cliente o admin no tienen ese concepto.

-- Lista cerrada del ciclo de vida del prestador (HU-06 → HU-11)
CREATE TYPE provider_status AS ENUM ('pendiente', 'aprobado', 'suspendido');


--2. PROVIDER_PROFILES — datos exclusivos del prestador (1 a 1 con users)
-- ------------------------------------------------------------
CREATE TABLE provider_profiles (
    user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    oficio              VARCHAR(80) NOT NULL,
    status              provider_status NOT NULL DEFAULT 'pendiente',

    -- Ubicación base del prestador.
    -- CHECK evita coordenadas geográficamente imposibles.
    lat                 DOUBLE PRECISION NOT NULL
                        CHECK (lat BETWEEN -90 AND 90),

    lng                 DOUBLE PRECISION NOT NULL
                        CHECK (lng BETWEEN -180 AND 180),

    -- Radio de cobertura en kilómetros.
    -- CHECK evita que se registre un radio 0 o negativo.
    coverage_radius_km  NUMERIC(5,2) NOT NULL DEFAULT 3.0
                        CHECK (coverage_radius_km > 0),

    -- Promedio de calificaciones.
    -- Siempre debe estar entre 0 y 5.
    avg_rating          NUMERIC(2,1) NOT NULL DEFAULT 0
                        CHECK (avg_rating BETWEEN 0 AND 5),

    -- El prestador puede pausar la recepción de solicitudes sin bloquear su cuenta.
    is_available        BOOLEAN NOT NULL DEFAULT TRUE,

    -- Administrador que aprobó al prestador.
    -- La validación de que realmente sea administrador
    -- la haremos posteriormente en el backend.
    approved_by         UUID REFERENCES users(id),

    approved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reduce candidatos antes de calcular Haversine por cada perfil.
CREATE INDEX idx_provider_profiles_search
    ON provider_profiles (oficio, status, user_id);

-- Lista cerrada de estados posibles de una solicitud, a lo largo de su ciclo de vida
CREATE TYPE request_status AS ENUM ('abierta', 'asignada', 'completada', 'cancelada');

-- ------------------------------------------------------------
-- 3. SERVICE_REQUESTS — solicitud de servicio publicada por el cliente (HU-02)
-- ------------------------------------------------------------
CREATE TABLE service_requests (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    oficio_needed         VARCHAR(80) NOT NULL,
    title                 VARCHAR(150) NOT NULL,
    description           TEXT NOT NULL,

    -- Coordenadas donde el cliente solicita el servicio.
    -- Se agregan CHECK para impedir valores fuera del rango
    -- válido de latitud y longitud.
    lat                   DOUBLE PRECISION NOT NULL
                          CHECK (lat BETWEEN -90 AND 90),

    lng                   DOUBLE PRECISION NOT NULL
                          CHECK (lng BETWEEN -180 AND 180),

    status                request_status NOT NULL DEFAULT 'abierta',
    assigned_provider_id  UUID REFERENCES users(id),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_service_requests_status_oficio ON service_requests (status, oficio_needed);

-- ------------------------------------------------------------
-- NOTIFICATIONS — avisos dentro de la plataforma (HU-04)
-- ------------------------------------------------------------
CREATE TABLE notifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type                VARCHAR(50) NOT NULL,
    title               VARCHAR(150) NOT NULL,
    message             TEXT NOT NULL,
    service_request_id  UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    read_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (recipient_id, service_request_id, type)
);

CREATE INDEX idx_notifications_recipient_created
    ON notifications (recipient_id, created_at DESC);
CREATE INDEX idx_notifications_unread
    ON notifications (recipient_id, created_at DESC) WHERE read_at IS NULL;

-- Lista cerrada de estados de una oferta
CREATE TYPE offer_status AS ENUM ('enviada', 'aceptada', 'rechazada', 'cerrada');

-- ------------------------------------------------------------
-- 4. OFFERS — oferta que un prestador envía sobre una solicitud (HU-08)
-- ------------------------------------------------------------
CREATE TABLE offers (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_request_id    UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    provider_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message               TEXT,
    status                offer_status NOT NULL DEFAULT 'enviada',
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- un mismo prestador NO puede ofertar dos veces sobre la misma solicitud
    UNIQUE (service_request_id, provider_id)
);
-- Nota: no hay columna 'price'. El acta define explícitamente que el pago
-- del oficio en sí queda por fuera de la plataforma (sección 5, alcance).

CREATE INDEX idx_offers_request ON offers (service_request_id);
CREATE INDEX idx_offers_provider ON offers (provider_id);

-- ------------------------------------------------------------
-- 5. RATINGS — calificación del cliente al prestador, al completar (HU-05)
-- ------------------------------------------------------------
CREATE TABLE ratings (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_request_id    UUID NOT NULL UNIQUE REFERENCES service_requests(id) ON DELETE CASCADE,
    client_id             UUID NOT NULL REFERENCES users(id),
    provider_id           UUID NOT NULL REFERENCES users(id),
    score                 SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 5),
    comment               TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 6. PAYMENTS — pagos de la suscripción mensual del prestador (HU-09)
-- ------------------------------------------------------------
CREATE TYPE payment_status AS ENUM ('pendiente', 'confirmado', 'fallido', 'reembolsado');

CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Periodo de suscripción que cubre este pago.
    -- 'Suscripción activa' (RN-12) se calcula en tiempo de consulta:
    -- existe un pago 'confirmado' de este prestador con period_end >= NOW().
    -- No se guarda un booleano 'activo' aparte para evitar que quede
    -- desincronizado del pago real que lo sustenta.
    period_start        TIMESTAMPTZ NOT NULL,
    period_end          TIMESTAMPTZ NOT NULL
                        CHECK (period_end > period_start),

    -- Valor del pago.
    -- No puede ser 0 ni negativo.
    amount              INTEGER NOT NULL
                        CHECK (amount > 0),

    currency            VARCHAR(3) NOT NULL DEFAULT 'COP',

    gateway             VARCHAR(20) NOT NULL
                        CHECK (gateway IN ('stripe', 'wompi')),

    gateway_reference   VARCHAR(120),

    status              payment_status NOT NULL DEFAULT 'pendiente',

    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Acelera la pregunta más frecuente del sistema: '¿tiene este
-- prestador una suscripción activa ahora mismo?' (se usa en cada
-- intento de oferta, por RN-12).
CREATE INDEX idx_payments_provider_period ON payments (provider_id, period_end);

-- ------------------------------------------------------------
-- 7. AUDIT_LOGS — trazabilidad de acciones críticas (HU-12)
-- ------------------------------------------------------------
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id        UUID REFERENCES users(id),   -- NULL si la acción la origina el sistema
    action          VARCHAR(80) NOT NULL,        -- ej. 'login', 'provider_approved', 'payment_confirmed'
    entity_type     VARCHAR(40),
    entity_id       UUID,
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_actor_date ON audit_logs (actor_id, created_at);
