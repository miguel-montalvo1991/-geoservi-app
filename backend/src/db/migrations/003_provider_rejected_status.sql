-- HU-06: permite distinguir un perfil rechazado de uno pendiente o suspendido.
ALTER TYPE provider_status ADD VALUE IF NOT EXISTS 'rechazado';
