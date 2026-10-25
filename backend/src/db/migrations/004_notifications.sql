-- HU-04: disponibilidad separada de la activación de la cuenta.
ALTER TABLE provider_profiles
    ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT TRUE;

-- Notificaciones persistentes para que el prestador pueda consultarlas
-- aunque no esté conectado cuando se publica la solicitud.
CREATE TABLE IF NOT EXISTS notifications (
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

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created
    ON notifications (recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread
    ON notifications (recipient_id, created_at DESC) WHERE read_at IS NULL;
