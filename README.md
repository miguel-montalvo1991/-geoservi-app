# GeoServi-App

Aplicación web que conecta a personas que necesitan un servicio doméstico (plomería, electricidad, cerrajería, jardinería, etc.) con prestadores que están cerca de ellas, usando geolocalización.

Proyecto formativo del programa Análisis y Desarrollo de Software (ADSO) del SENA, ficha 3229209.

## Integrantes

- Luis Miguel Montalvo Álvarez
- Diego Andrés Bermúdez

## Tecnologías

| Parte | Tecnologías |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4 |
| Backend | Node.js, Express 5, JWT, bcrypt, Zod, Helmet |
| Base de datos | PostgreSQL (SQL directo con `pg`, sin ORM) |

La decisión de no usar ORM está explicada en `docs/ADR-001_SQL_Crudo_vs_ORM_GeoServiApp.docx.md`.

## Estructura del proyecto

```
geoservi-app/
├── backend/
│   ├── scripts/            # migrate.js (ejecuta archivos .sql)
│   └── src/
│       ├── config/         # conexión a la base de datos
│       ├── db/             # schema.sql, migraciones y seed del admin
│       ├── middlewares/    # autenticación, roles, errores, rate limit
│       └── modules/        # auth y providers
├── frontend/
│   └── src/
│       ├── api/            # cliente HTTP
│       ├── components/     # componentes reutilizables
│       ├── context/        # AuthContext (sesión)
│       └── pages/          # Login, Register, Home
├── docs/                   # documentación del proyecto
└── Contributing.md         # flujo de trabajo con Git
```

## Requisitos

- Node.js 20 o superior
- PostgreSQL 14 o superior
- Git

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/<usuario>/<repositorio>.git
cd <repositorio>
```

### 2. Crear la base de datos

Entra a `psql` con un usuario administrador y ejecuta:

```sql
CREATE USER geoservi_user WITH PASSWORD 'geoservi_pass';
CREATE DATABASE geoservi OWNER geoservi_user;
```

Si quieres usar otro usuario o contraseña, recuerda cambiarlos después en el `.env`.

### 3. Configurar el backend

```bash
cd backend
npm install
cp .env.example .env
```

En Windows con PowerShell, en vez de `cp` usa:

```powershell
Copy-Item .env.example .env
```

Abre el archivo `.env` y completa `JWT_SECRET` con una cadena larga y aleatoria. Puedes generar una así:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Variables del backend:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor | `4000` |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL | `postgresql://geoservi_user:geoservi_pass@localhost:5432/geoservi` |
| `JWT_SECRET` | Clave para firmar los tokens | (cadena aleatoria) |

### 4. Crear las tablas

Desde la carpeta `backend`:

```bash
node scripts/migrate.js src/db/schema.sql src/db/migrations/001_account_status.sql
```

Solo se corre una vez. Si lo repites te va a dar errores porque las tablas ya existen.

### 5. Iniciar el backend

```bash
npm run dev
```

Debe aparecer `Servidor backend activo en http://localhost:4000`. Para comprobar que funciona abre `http://localhost:4000/health` en el navegador.

### 6. Configurar e iniciar el frontend

En otra terminal:

```bash
cd frontend
npm install
```

Crea un archivo `.env` dentro de `frontend` con:

```
VITE_API_URL=http://localhost:4000
```

Luego:

```bash
npm run dev
```

Vite muestra la dirección, normalmente `http://localhost:5173`.

## Crear un usuario administrador

El registro público no permite crear administradores a propósito. Para crear el primero:

1. Agrega temporalmente estas líneas al `.env` del backend:

   ```
   ADMIN_NAME="Nombre Apellido"
   ADMIN_EMAIL="admin@geoservi.local"
   ADMIN_PASSWORD="una-clave-segura-123"
   ```

2. Ejecuta desde `backend`:

   ```bash
   npm run seed:admin
   ```

3. Borra esas tres líneas del `.env`.

## Scripts disponibles

| Carpeta | Comando | Qué hace |
|---|---|---|
| backend | `npm run dev` | Inicia el servidor con recarga automática (nodemon) |
| backend | `npm start` | Inicia el servidor sin recarga |
| backend | `npm run seed:admin` | Crea el usuario administrador |
| frontend | `npm run dev` | Inicia el servidor de desarrollo de Vite |
| frontend | `npm run build` | Genera la versión para producción |
| frontend | `npm run lint` | Revisa el código con oxlint |

## Endpoints disponibles

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/health` | Público | Comprueba que el backend funciona |
| POST | `/auth/register` | Público | Crea una cuenta (rol `cliente` o `prestador`) |
| POST | `/auth/login` | Público | Inicia sesión y devuelve un token JWT |
| GET | `/auth/me` | Con sesión | Devuelve el usuario del token |
| POST | `/providers/me` | Prestador | Crea el perfil del prestador |
| GET | `/providers/me` | Prestador | Consulta el perfil propio |
| PATCH | `/providers/me` | Prestador | Actualiza el perfil propio |
| GET | `/providers/:id` | Con sesión | Consulta un prestador por id |
| PATCH | `/providers/:id/status` | Administrador | Cambia el estado de un prestador |

Las rutas con sesión necesitan el encabezado `Authorization: Bearer <token>`.

## Roles

- **Cliente**: busca y solicita servicios.
- **Prestador**: ofrece servicios y atiende solicitudes cercanas.
- **Administrador**: aprueba o suspende prestadores.

## Estado del proyecto

Hecho:
- Registro e inicio de sesión con roles (HU-01)
- Verificación de sesión con token JWT
- Perfil de prestador (crear, consultar y actualizar)
- Pantallas de Login y Registro
- Esquema de base de datos

Pendiente:
- Publicación de solicitudes de servicio (HU-02)
- Búsqueda de prestadores por cercanía (HU-03)
- Ofertas, notificaciones, pagos, calificaciones y auditoría
- PWA (HU-12)

El detalle de cada historia de usuario está en `docs/Backlog_HistoriasUsuario_GeoServiApp_v3.0.docx.md`.

## Documentación

- `docs/Formulacion_Constitucion_GeoServiApp_v5.1.docx.md`: formulación del proyecto
- `docs/Backlog_HistoriasUsuario_GeoServiApp_v3.0.docx.md`: historias de usuario
- `docs/Ampliacion_Alcance_GestionCuentas_GeoServiApp_v1.0.docx.md`: ampliación de alcance
- `docs/ADR-001_SQL_Crudo_vs_ORM_GeoServiApp.docx.md`: decisión SQL directo vs ORM
- `docs/issue-backlog.md`: lista de issues

## Cómo trabajamos con Git

Usamos ramas por funcionalidad y commits con el formato `tipo(alcance): mensaje`. Todo el detalle está en [Contributing.md](Contributing.md).

## Licencia

Proyecto académico del SENA. Todos los derechos reservados a sus autores.
