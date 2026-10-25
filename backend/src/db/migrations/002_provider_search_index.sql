-- HU-03: acelera el filtro de candidatos por oficio y aprobación.
CREATE INDEX IF NOT EXISTS idx_provider_profiles_search
    ON provider_profiles (oficio, status, user_id);
