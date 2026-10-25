# GeoServi-App — Backlog de Issues para GitHub

Generado a partir de: README de Avance (corte 2026-09-23), Backlog v3.0 y el
trabajo ya realizado en esta conversación (HU-02, HU-03). **Antes de crear
estos issues en GitHub, revisa que el detalle Given/When/Then de cada HU en
tu Backlog v3.0 coincida con lo resumido aquí** — este documento usa el nivel
de detalle que hay en el README, no el Backlog completo.

Cómo usar esto: cada bloque de abajo = un issue. Copia el título y el cuerpo
tal cual al crear el issue en GitHub. Las etiquetas (`labels`) debes crearlas
una vez en tu repo (Settings → Labels) antes de usarlas.

**Labels sugeridos a crear:** `epica:auth`, `epica:providers`, `epica:requests`,
`epica:offers`, `epica:payments`, `epica:admin`, `epica:ratings`,
`epica:messaging`, `epica:frontend`, `epica:docs`, `prioridad:alta`,
`prioridad:media`, `alcance:extendido`, `status:hecho`.

---

## ✅ Ya completadas (crear como issue y cerrarlo de inmediato, por trazabilidad)

### HU-01 — Registro y login de usuarios
- **Labels:** `epica:auth`, `status:hecho`
- **Rama que lo implementó:** (la que usaron originalmente, regístrala si la recuerdas)
- Registro y login con Zod, bcrypt (costo 10), JWT (expira 1h), rate limiting
  (30 peticiones/15 min), `GET /auth/me` protegido, mensaje genérico ante
  credenciales inválidas.
- **Estado:** Completo. Issue creado solo para trazabilidad histórica.

### HU-06 — Perfil de prestador (parcial)
- **Labels:** `epica:providers`, `status:hecho`
- `POST/GET/PATCH /providers/me`. Perfil queda "pendiente" hasta aprobación
  admin (RN-12). PATCH bloquea intencionalmente `status`/`approved_by`/`approved_at`.
- **Falta de esta HU** (crear como issue aparte, ver sección Pendientes):
  la UI/endpoint admin para aprobar/rechazar.

---

## 🔶 En progreso (recién escritas en esta sesión — falta probar y commitear)

### HU-02 — Publicar solicitud de servicio
- **Labels:** `epica:requests`, `prioridad:alta`
- **Rama:** `feature/HU-02-publicar-solicitud`
- `POST /requests` y `GET /requests/mine` en `src/modules/requests/`.
  `client_id` tomado de `req.user.id`, nunca del body.
- **Checklist:**
  - [ ] Código copiado a `request.controller.js` / `request.routes.js`
  - [ ] Ruta registrada en `app.js`
  - [ ] Probado con un usuario `cliente` real (Postman/Thunder Client)
  - [ ] Commit con `feat(requests): agregar endpoint POST /requests (HU-02)`

### HU-03 — Búsqueda de prestadores por radio (Haversine)
- **Labels:** `epica:providers`, `prioridad:alta`
- **Rama:** `feature/HU-03-busqueda-haversine`
- `GET /providers/search`, filtra por `status='aprobado'`,
  `account_status='activo'`, oficio, y cruza radio pedido vs `coverage_radius_km`.
  Requisito no funcional: <2s en radio de 5km.
- **Checklist:**
  - [ ] Código en `provider.controller.js` / `provider.routes.js`
  - [ ] Ruta `/search` registrada ANTES de `/:id`
  - [ ] Al menos un prestador `aprobado` de prueba en la BD
  - [ ] Probado end-to-end
  - [ ] Commit con `feat(providers): búsqueda por radio con Haversine (HU-03)`

### Migración — `account_status` en `users`
- **Labels:** `epica:docs`, `status:hecho`
- **Rama:** `chore/migration-account-status`
- Soporta HU-17, HU-18, HU-19. Ejecutada vía pgAdmin.
- **Checklist:**
  - [ ] Archivo `src/db/migrations/001_account_status.sql` commiteado
  - [ ] Commit con `chore(db): agregar migración 001_account_status`

---

## ⏳ Pendientes — Núcleo garantizado (18 HU)

### HU-04 — Notificación a prestadores cercanos
- **Labels:** `epica:requests`, `prioridad:alta`
- **Rama:** `feature/HU-04-notificar-prestadores`
- **Decisión de diseño:** tabla `notifications` propia para consultar avisos y
  marcar su lectura; `audit_logs` queda reservado para trazabilidad de acciones.
- La publicación de una solicitud notifica, dentro de una transacción, a los
  prestadores aprobados, activos y disponibles del mismo oficio dentro de
  `LEAST(5 km, coverage_radius_km)`.
- API: `GET /notifications/mine` y `PATCH /notifications/:id/read`.
- La disponibilidad se gestiona desde `PATCH /providers/me` con `is_available`.
- Migración: `004_notifications.sql`.

### HU-05 — Enviar oferta (con validación de límite)
- **Labels:** `epica:offers`, `prioridad:alta`
- **Rama:** `feature/HU-05-enviar-oferta`
- Depende de: `service_requests` funcionando (HU-02).

### HU-07 — Validación de oferta
- **Labels:** `epica:offers`, `prioridad:media`
- **Rama:** `feature/HU-07-validacion-oferta`

### HU-08 — Transiciones automáticas de estado del prestador
- **Labels:** `epica:providers`, `prioridad:media`
- **Rama:** `feature/HU-08-transiciones-estado`

### HU-09 — Pagos (Stripe/Wompi sandbox)
- **Labels:** `epica:payments`, `prioridad:media`
- **Rama:** `feature/HU-09-pagos-sandbox`

### HU-10 — Registro en audit_logs de acciones críticas
- **Labels:** `epica:admin`, `prioridad:media`
- **Rama:** `feature/HU-10-audit-logs`

### HU-11 — (verificar numeración exacta en Backlog v3.0)
- **Labels:** `epica:providers`, `prioridad:media`
- ⚠️ No está detallada en el README de avance que tengo — revisa el Backlog
  v3.0 para el título y criterios exactos antes de crear este issue.

### HU-12 — PWA completa (manifest + service worker)
- **Labels:** `epica:frontend`, `prioridad:media`
- **Rama:** `feature/HU-12-pwa-manifest`

### HU-13 — Finalización de servicio con evidencia JPG
- **Labels:** `epica:providers`, `prioridad:media`
- **Rama:** `feature/HU-13-evidencia-finalizacion`

### HU-14 — Aceptar oferta y transición de estado de la solicitud
- **Labels:** `epica:offers`, `prioridad:alta`
- **Rama:** `feature/HU-14-aceptar-oferta`

### Panel administrador — Aprobar/rechazar prestadores (UI de HU-06)
- **Labels:** `epica:admin`, `prioridad:alta`
- **Rama:** `feature/admin-aprobar-rechazar-prestador`

### HU-16 — Suspender/reactivar prestador (panel admin)
- **Labels:** `epica:admin`, `prioridad:media`
- **Rama:** `feature/HU-16-suspender-reactivar`
- Depende de: `account_status` ya migrado (listo ✅).

### HU-17 — Baja voluntaria de cuenta (frontend + backend)
- **Labels:** `epica:admin`, `epica:frontend`, `prioridad:media`
- **Rama:** `feature/HU-17-baja-voluntaria`

### HU-18 — Bloquear usuario (panel admin)
- **Labels:** `epica:admin`, `prioridad:media`
- **Rama:** `feature/HU-18-bloquear-usuario`

### HU-19 — Eliminar usuario (física, condicionada a sin actividad histórica)
- **Labels:** `epica:admin`, `prioridad:media`
- **Rama:** `feature/HU-19-eliminar-usuario`

---

## ⏳ Pendientes — Alcance extendido (1 HU)

### HU-15 — Mensajería en tiempo real (Socket.io)
- **Labels:** `epica:messaging`, `alcance:extendido`, `prioridad:baja`
- **Rama:** `feature/HU-15-mensajeria-socketio`

---

## ⏳ Pendientes — No formalizada aún como HU numerada

### Módulo `ratings` — calificaciones
- **Labels:** `epica:ratings`, `prioridad:media`
- ⚠️ Primero formalizar como HU en el Backlog (mismo proceso que usaron para
  HU-15/HU-16 en el Addendum), luego crear el issue de implementación.

---

## ⏳ Pendientes — Frontend

### Pantalla de Registro
- **Labels:** `epica:frontend`, `prioridad:alta`
- **Rama:** `feature/frontend-registro`
- Mismo patrón que el Login ya funcional (`AuthContext`).

### Animación de radar (pantalla de inicio)
- **Labels:** `epica:frontend`, `prioridad:baja`
- **Rama:** `feature/frontend-animacion-radar`
- Concepto ya definido: círculos concéntricos, barrido girando, "blips".

### Pantallas restantes (solicitudes, ofertas, panel admin, pagos, mensajería)
- **Labels:** `epica:frontend`, `prioridad:media`
- Crear un issue por pantalla cuando el backend correspondiente esté listo
  (no antes — evita construir UI contra un endpoint que aún puede cambiar).

---

## ⏳ Pendientes — Técnicos / no bloqueantes

### Corregir condición de carrera en validación de email de registro
- **Labels:** `epica:auth`, `prioridad:baja`
- **Rama:** `fix/race-condition-email-register`
- Cambiar el `SELECT` previo al `INSERT` por `ON CONFLICT` en el registro.

---

## ⏳ Pendientes — Antes de sustentar

### Actualizar "Alcance y Especificación de Requisitos" con referencia a ADR-001
- **Labels:** `epica:docs`, `prioridad:media`

### Primer checkpoint de despliegue real (Vercel + Render + Neon)
- **Labels:** `epica:docs`, `prioridad:alta`
- Condicionado a: `service_requests` y `offers` completas de punta a punta.

### Verificar consistencia final entre todos los documentos
- **Labels:** `epica:docs`, `prioridad:alta`
- Formulación v5.1, Backlog v3.0, Addendum, Ampliación de Alcance, ADR-001, Costos.
