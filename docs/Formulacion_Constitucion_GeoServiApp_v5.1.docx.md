  
**SERVICIO NACIONAL DE APRENDIZAJE \- SENA**

Tecnólogo en Análisis y Desarrollo de Software (ADSO)

**FORMULACIÓN Y CONSTITUCIÓN DEL PROYECTO**

**GeoServi-App (ECOMIBARRIO)**

*Plataforma web de conexión entre clientes y prestadores de servicios de oficios mediante geolocalización*

**Versión 5.1 — Consolidada**

Ficha de caracterización: 3229209

**Equipo de desarrollo:**

Luis Miguel Montalvo Álvarez — Líder de proyecto / Backend

Diego Andrés Bermúdez — Frontend / Backend

Instructor: Deimer Miranda Montoya, MSc.(c)

Medellín, Colombia  
Septiembre de 2026

# **Control de versiones**

| Versión | Fecha | Estado | Cambios principales |
| :---- | :---- | :---- | :---- |
| v1.0 | 01/08/2026 | Obsoleta | Formulación inicial y acta de constitución; núcleo garantizado preliminar (HU-01 a HU-08, HU-11 mínima). |
| v2.0 | 19/08/2026 | Obsoleta | Ajustes al modelo de negocio y estructura de épicas tras retroalimentación de la Clase 4\. |
| v3.0 | 29/08/2026 | Obsoleta | Modelo de suscripción mensual sandbox Stripe/Wompi; núcleo garantizado ampliado a 13 HU (HU-01 a HU-13). |
| v4.0 | 17/09/2026 | Obsoleta | Núcleo garantizado ampliado a 14 HU (se incorpora HU-14 Aceptar oferta); base del prompt de sustentación. |
| v5.0 | 23/09/2026 | Reemplazada por v5.1 | Versión consolidada: integra HU-15 (Mensajería en tiempo real, alcance extendido) y HU-16 (Suspensión de prestador, núcleo garantizado); referencia formal al ADR-001; incorpora análisis de costos de despliegue. |
| v5.1 | 23/09/2026 | Vigente | Incorpora HU-17 (baja voluntaria de cuenta), HU-18 (bloqueo permanente de perfil) y HU-19 (eliminación física de perfil), todas núcleo garantizado; núcleo garantizado pasa de 15 a 18 historias; épicas EP-01 y EP-03 renombradas y ampliadas. |

*Esta versión (v5.1) es la formulación oficial y vigente del proyecto GeoServi-App. Todas las versiones anteriores (v1.0 a v5.0) quedan obsoletas y se conservan únicamente como referencia histórica del proceso de formulación.*

# **1\. Información general del proyecto**

| Nombre del proyecto | GeoServi-App (ECOMIBARRIO) |
| :---- | :---- |
| Programa de formación | Tecnólogo en Análisis y Desarrollo de Software (ADSO) |
| Ficha | 3229209 |
| Instructor | Deimer Miranda Montoya, MSc.(c) |
| Equipo de desarrollo | Luis Miguel Montalvo Álvarez (Líder de proyecto / Backend), Diego Andrés Bermúdez (Frontend / Backend) |
| Modalidad de trabajo | Pair programming, sin división formal de módulos por integrante |
| Fecha de inicio | 1 de agosto de 2026 |
| Fecha de cierre prevista | 31 de diciembre de 2026 |

# **2\. Planteamiento del problema y justificación**

En los barrios y sectores residenciales de las ciudades colombianas, gran parte de los oficios de uso cotidiano (plomería, electricidad, aseo y jardinería, entre otros) se contratan de manera informal: por recomendación de vecinos, grupos de mensajería o volantes físicos. Este proceso, aunque funcional, carece de mecanismos de verificación del prestador, de trazabilidad de la solicitud y de un canal formal para gestionar ofertas, tiempos de respuesta y calificaciones del servicio prestado.

Esta informalidad genera dos problemas complementarios: para el cliente, incertidumbre sobre la idoneidad del prestador y ausencia de un historial de confianza; para el prestador independiente, dificultad para hacerse visible ante nuevos clientes fuera de su círculo cercano, sin depender de plataformas internacionales que no siempre se ajustan a la dinámica de servicios de oficios a nivel de barrio.

GeoServi-App busca resolver esta brecha mediante una plataforma web (PWA) que conecta clientes y prestadores de servicios de oficios a partir de la geolocalización real del usuario, permitiendo publicar solicitudes, recibir ofertas de prestadores cercanos, aprobar prestadores mediante un proceso de validación administrativa, y sostener el modelo mediante una suscripción mensual pagada por el prestador, en lugar de comisión por cada servicio prestado.

# **3\. Objetivos**

## **3.1 Objetivo general**

Desarrollar una plataforma web progresiva (PWA) que conecte clientes y prestadores de servicios de oficios mediante geolocalización, permitiendo la publicación de solicitudes, el envío y aceptación de ofertas, y la administración de prestadores, bajo un modelo de monetización por suscripción mensual.

## **3.2 Objetivos específicos**

* Implementar un módulo de autenticación con tres roles (cliente, prestador, administrador) y control de acceso basado en JWT.

* Diseñar y construir un mecanismo de búsqueda de prestadores por radio de geolocalización, utilizando la fórmula de Haversine sobre PostgreSQL.

* Desarrollar el ciclo de vida completo de una solicitud de servicio: publicación, notificación a prestadores, envío de ofertas, aceptación y finalización con evidencia fotográfica.

* Implementar el modelo de monetización basado en suscripción mensual del prestador, integrando una pasarela de pagos en modo sandbox (Stripe/Wompi).

* Construir un panel administrativo para la aprobación, rechazo y suspensión de prestadores, con registro de auditoría de las acciones críticas.

* Entregar el frontend como una Progressive Web App (PWA), instalable y funcional en navegadores de escritorio y dispositivos Android.

# **4\. Alcance del proyecto**

El alcance del proyecto se organiza en tres niveles: núcleo garantizado (compromiso mínimo de entrega), alcance extendido (funcionalidades adicionales sujetas al tiempo disponible) y elementos explícitamente fuera de alcance.

## **4.1 Núcleo garantizado (18 historias de usuario)**

Corresponde a las historias de usuario HU-01 a HU-14 (Formulación v4), más HU-16 (suspensión de prestador, incorporada en v5.0), más HU-17, HU-18 y HU-19 (gestión de cuentas: baja voluntaria, bloqueo permanente y eliminación física de un perfil, incorporadas en esta versión v5.1).

| HU | Descripción |
| :---- | :---- |
| HU-01 | Registro e inicio de sesión con 3 roles (cliente, prestador, administrador) |
| HU-02 | Publicación de una solicitud de servicio con geolocalización real |
| HU-03 | Búsqueda de prestadores disponibles por radio de cercanía (Haversine) |
| HU-04 | Notificación a prestadores cercanos ante una nueva solicitud |
| HU-05 | Envío de una oferta de un prestador sobre una solicitud |
| HU-06 | Aprobación o rechazo de prestadores por parte del administrador |
| HU-07 | Envío de oferta con validación de reglas de negocio (RN-12: límite de ofertas pendientes) |
| HU-08 | Gestión de los estados del prestador: Disponible / No disponible / En servicio |
| HU-09 | Pago de suscripción mensual mediante pasarela sandbox Stripe/Wompi |
| HU-10 | Auditoría de acciones administrativas críticas (registro inmutable, consultable) |
| HU-11 | Notificaciones básicas dentro de la plataforma |
| HU-12 | Progressive Web App (PWA): manifest y service worker |
| HU-13 | Finalización de un servicio con evidencia fotográfica (JPG) |
| HU-14 | Aceptación de una oferta y transición de estado del prestador |
| HU-16 | Suspensión (y reactivación) de un prestador por parte del administrador |
| HU-17 | Baja voluntaria de cuenta por el propio cliente o prestador |
| HU-18 | Bloqueo permanente de un perfil (cliente o prestador) por el administrador |
| HU-19 | Eliminación física de un perfil sin actividad histórica, por el administrador |

## **4.2 Alcance extendido**

Funcionalidades que se implementarán si el cronograma lo permite, una vez cubierto el núcleo garantizado:

* HU-15: Mensajería en tiempo real entre cliente y prestador (Socket.io), habilitada únicamente cuando existe al menos una oferta activa sobre la solicitud (RF-14, RN-13).

* Notificaciones en tiempo real vía Socket.io ante nuevas ofertas (complemento de HU-11).

* Versión completa de HU-12 (funcionalidades avanzadas de PWA más allá del manifest y service worker básicos).

## **4.3 Explícitamente fuera de alcance**

* Notificaciones push nativas (se documenta Capacitor como posible dirección de evolución futura, fuera del alcance de este proyecto de grado).

* Acceso a cámara mediante SDK nativo (misma consideración que el punto anterior).

* Recuperación de contraseña autogestionada.

* Edición o desactivación de servicios ya publicados.

* Cancelación de solicitudes ya publicadas.

# **5\. Épicas del proyecto**

| Épica | Nombre | Historias asociadas |
| :---- | :---- | :---- |
| EP-01 | Autenticación y gestión de cuenta | HU-01, HU-17 |
| EP-02 | Publicación y búsqueda | HU-02, HU-03, HU-04 |
| EP-03 | Perfiles y gobernanza de cuentas | HU-06, HU-08, HU-16, HU-18, HU-19 |
| EP-04 | Ofertas y ciclo de vida del servicio | HU-05, HU-07, HU-13, HU-14, HU-15 |
| EP-05 | Monetización y gobernanza | HU-09, HU-10 |
| EP-06 | Experiencia y accesibilidad | HU-11, HU-12 |

# **6\. Arquitectura y stack tecnológico**

## **6.1 Componentes principales**

| Componente | Tecnología |
| :---- | :---- |
| Frontend | React \+ Vite \+ Tailwind CSS \+ React Router, empaquetado como PWA |
| Backend | Node.js \+ Express, organizado por capas (rutas, controladores, servicios) |
| Base de datos | PostgreSQL, acceso mediante SQL crudo con el driver 'pg' (ver ADR-001) |
| Autenticación | JWT \+ bcrypt (costo mínimo 10\) |
| Tiempo real | Socket.io (alcance extendido: HU-15 y notificaciones de ofertas) |
| Pagos | Pasarela sandbox Stripe / Wompi |

## **6.2 Decisiones de arquitectura relevantes**

La decisión de usar SQL crudo con el driver 'pg' en lugar de un ORM está formalmente documentada en el ADR-001, y responde principalmente a la necesidad de control total sobre las consultas geoespaciales (fórmula de Haversine) y al cumplimiento del requisito no funcional de tiempo de respuesta menor a 2 segundos para un radio de búsqueda de 5 km.

## **6.3 Requisitos no funcionales clave**

* Costo de encriptación bcrypt: factor mínimo de 10\.

* Tiempo de respuesta de búsqueda por radio (Haversine): menor a 2 segundos para un radio de 5 km.

* Compatibilidad de la PWA: navegadores Chrome y Edge, en escritorio y en dispositivos Android.

Con la incorporación de HU-17, HU-18 y HU-19, la tabla users requiere un campo de estado de cuenta (account\_status: activo / inactivo\_baja / bloqueado) que soporte la baja voluntaria (RN-15) y el bloqueo administrativo (RN-16) sin necesidad de borrar filas; la eliminación física (RN-17) queda restringida a perfiles sin actividad histórica asociada, para preservar la integridad referencial y el historial de auditoría (HU-10).

# **7\. Modelo de despliegue**

El sistema se despliega en tres proveedores especializados, según el diagrama de despliegue UML del proyecto:

* Vercel: hospedaje del frontend (build estático de la PWA), descargado por el navegador vía HTTPS.

* Render: hospedaje del backend Node.js \+ Express, expuesto como API REST/JSON sobre HTTPS con TLS gestionado por Render.

* Neon: base de datos PostgreSQL administrada (versión 16), con conexión TCP/SSL por el puerto 5432 y respaldo automático.

* El backend se conecta además, vía HTTPS/API REST, a la pasarela de pagos SaaS externa en modo sandbox.

Durante la fase de desarrollo y sustentación del proyecto de grado, el despliegue se realiza íntegramente sobre los planes gratuitos de estos tres proveedores, con un costo de \$0 USD/mes. Una eventual puesta en producción tendría un costo estimado de entre \$12 y \$42 USD/mes, sin contar comisiones por transacción de la pasarela de pagos (detalle completo en el documento "Análisis de Costos de Despliegue").

# **8\. Modelo de negocio**

GeoServi-App se sostiene mediante una suscripción mensual pagada por el prestador de servicios (no por el cliente, y no por comisión sobre cada servicio prestado). La regla de negocio RN-12 valida, en tiempo de consulta, si el prestador cuenta con una suscripción activa (a partir de los campos period\_start/period\_end de la tabla payments) antes de permitirle enviar nuevas ofertas.

# **9\. Interesados clave**

| Interesado | Nivel de gestión | Rol frente al proyecto |
| :---- | :---- | :---- |
| Administrador (equipo de desarrollo) | Gestionar de cerca | Aprueba y suspende prestadores; supervisa auditoría del sistema |
| Instructor (Deimer Miranda Montoya) | Gestionar de cerca | Evalúa avances y aprueba entregables del proyecto de grado |
| Equipo de desarrollo | Gestionar de cerca | Construye, prueba y documenta la plataforma |
| Cliente final | Mantener informado | Publica solicitudes de servicio y contrata prestadores |
| Prestador de servicios | Mantener informado | Ofrece servicios, paga la suscripción mensual y atiende solicitudes |

# **10\. Cronograma general**

Las fases del proyecto se distribuyen desde el 1 de agosto hasta el 31 de diciembre de 2026:

| Fase | Periodo aproximado | Entregable principal |
| :---- | :---- | :---- |
| Formulación y planeación | Ago. 2026 | Acta de constitución, Formulación v1-v5, Gestión de interesados |
| Análisis y diseño | Ago. \- Sep. 2026 | Backlog, casos de uso, modelo de datos, diagramas UML |
| Construcción — núcleo backend | Sep. 2026 | Autenticación, perfiles de prestador, solicitudes, ofertas |
| Construcción — frontend y monetización | Oct. 2026 | PWA, panel admin, pagos sandbox, estados del prestador |
| Alcance extendido y pulido | Nov. 2026 | Mensajería en tiempo real (HU-15), notificaciones, ratings |
| Documentación final y sustentación | Dic. 2026 | Documentación consolidada y presentación ante el instructor |

# **11\. Documentos relacionados**

Esta formulación se apoya en y debe leerse junto con los siguientes documentos del proyecto:

* Acta de Constitución del Proyecto

* Backlog, Historias de Usuario y Casos de Uso (a actualizar con HU-15 a HU-19 según este documento)

* Alcance y Especificación de Requisitos (a actualizar referenciando el ADR-001)

* Addendum de Resolución de Incoherencias v1.0

* Ampliación de Alcance v1.0 — Gestión de Cuentas de Usuario (HU-17, HU-18, HU-19)

* ADR-001: Uso de SQL crudo con 'pg' en vez de un ORM

* Análisis de Costos de Despliegue

* Gestión de Interesados v2

* P04 — Modelado UML: diagramas de secuencia y actividades

* Casos de Uso y Escenarios v1.1

# **12\. Aprobación**

Este documento fue elaborado por el equipo de desarrollo y se somete a la revisión y aprobación del instructor del proyecto de grado.

| Luis Miguel Montalvo Álvarez | Diego Andrés Bermúdez |
| :---: | :---: |

| Deimer Miranda Montoya, MSc.(c) — Instructor |
| :---: |

