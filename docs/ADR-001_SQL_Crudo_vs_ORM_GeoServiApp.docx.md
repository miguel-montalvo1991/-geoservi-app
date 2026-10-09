**SERVICIO NACIONAL DE APRENDIZAJE \- SENA**

Análisis y Desarrollo de Software (ADSO) — Ficha 3229209

**ADR-001: Uso de SQL crudo con el driver 'pg' en vez de un ORM**

| Proyecto | GeoServi-App (ECOMIBARRIO) |
| :---- | :---- |
| **Estado** | Aceptado |
| **Fecha** | 23 de septiembre de 2026 |
| **Decisores** | Luis Miguel Montalvo Álvarez (Líder/Backend), Diego Andrés Bermúdez (Frontend/Backend) |
| **Documento relacionado** | Alcance y Especificación de Requisitos v1.2/v1.3 |

# **Contexto**

GeoServi-App necesita una capa de acceso a datos para PostgreSQL que soporte consultas geoespaciales (fórmula de Haversine para búsqueda por radio) y consultas de agregación para el cálculo de suscripción activa (RN-12), auditoría (HU-10) y, con la incorporación de HU-16, el nuevo estado de suspensión de prestadores. El equipo debía decidir entre usar un ORM (por ejemplo Prisma o Sequelize) o el driver nativo 'pg' con SQL escrito a mano.

# **Decisión**

Se decide usar el driver nativo 'pg' de Node.js con consultas SQL escritas directamente (SQL crudo), sin introducir un ORM.

# **Justificación**

* Control total sobre las consultas geoespaciales con la fórmula de Haversine, que requieren cálculos matemáticos directos en SQL difíciles de expresar de forma eficiente a través del query-builder de un ORM.

* El requisito no funcional de tiempo de respuesta (menor a 2 segundos para un radio de búsqueda de 5 km) se cumple más fácilmente cuando el equipo controla el plan de ejecución de la consulta sin capas de abstracción intermedias.

* El equipo trabaja bajo pair programming sin división formal de módulos por integrante; SQL crudo mantiene una curva de aprendizaje más plana que dominar la API de un ORM específico, dado que ninguno de los dos integrantes tenía experiencia previa profunda con Node.js/PostgreSQL antes de este proyecto.

* El esquema de la base de datos (9 tablas, con relaciones ya validadas en producción local) es estable y no se prevén migraciones frecuentes que justifiquen el sistema de migraciones automático de un ORM.

# **Consecuencias**

Positivas:

* Mayor control y transparencia sobre cada consulta ejecutada contra PostgreSQL.

* Sin dependencia de una capa adicional que deba mantenerse actualizada ni curva de aprendizaje de una API propietaria.

Negativas / riesgos asumidos:

* Mayor responsabilidad del equipo para prevenir inyección SQL: se mitiga usando exclusivamente consultas parametrizadas (\$1, \$2, …) del driver 'pg', nunca concatenación de strings.

* No hay generación automática de migraciones ni de tipados; los cambios de esquema se gestionan manualmente sobre schema.sql y se documentan en el control de cambios del proyecto.

* La validación de datos de entrada recae completamente en la capa de aplicación (ya cubierta con Zod en los controladores existentes).

# **Alternativas consideradas**

Se consideró usar Prisma como ORM, pero se descartó porque su soporte para consultas geoespaciales personalizadas (Haversine) requiere igualmente caer a SQL crudo mediante \$queryRaw, lo que habría introducido la complejidad de un ORM sin eliminar la necesidad de escribir SQL manual para el requisito más crítico del sistema (búsqueda por radio).