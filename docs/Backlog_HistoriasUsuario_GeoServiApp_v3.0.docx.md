**SERVICIO NACIONAL DE APRENDIZAJE \- SENA**

Análisis y Desarrollo de Software (ADSO) — Ficha 3229209

**Proyecto de grado: GeoServi-App (ECOMIBARRIO)**

**Backlog, Historias de Usuario y Casos de Uso — v3.0 (Consolidado)**

# **Control de cambios**

| Versión | Fecha | Cambios |
| :---- | :---- | :---- |
| v1.0 | 29/08/2026 | 13 historias del núcleo garantizado (HU-01 a HU-13) en 6 épicas. |
| v1.1 | 02/09/2026 | Sección de casos de uso ampliada (CU-01 a CU-03) con escenarios Given/When/Then. |
| v2.0 (P01) | 17/09/2026 | Backlog oficial autoritativo; criterios de aceptación completos; exclusiones explícitas de alcance. |
| v3.0 | 23/09/2026 | Versión consolidada y vigente: incorpora HU-14 (Formulación v4), HU-15 (Mensajería, alcance extendido), HU-16 (Suspensión de prestador), HU-17, HU-18, HU-19 (gestión de cuentas). Total: 19 historias (18 núcleo garantizado \+ 1 extendida). |

*Este documento reemplaza y consolida todas las versiones anteriores del Backlog. Se elabora a partir de la Formulación y Constitución v5.1, el Addendum de Resolución de Incoherencias v1.0 y la Ampliación de Alcance v1.0 (Gestión de Cuentas).*

# **1\. Introducción**

Este documento consolida el backlog completo de GeoServi-App: 18 historias de usuario del núcleo garantizado y 1 historia del alcance extendido, organizadas en 6 épicas, con sus criterios de aceptación, reglas de negocio, dependencias y casos de uso críticos.

# **2\. Épicas del proyecto**

| Épica | Nombre | Historias asociadas |
| :---- | :---- | :---- |
| EP-01 | Autenticación y gestión de cuenta | HU-01, HU-17 |
| EP-02 | Publicación y búsqueda | HU-02, HU-03, HU-04 |
| EP-03 | Perfiles y gobernanza de cuentas | HU-06, HU-08, HU-16, HU-18, HU-19 |
| EP-04 | Ofertas y ciclo de vida del servicio | HU-05, HU-07, HU-13, HU-14, HU-15 |
| EP-05 | Monetización y gobernanza | HU-09, HU-10 |
| EP-06 | Experiencia y accesibilidad | HU-11, HU-12 |

# **3\. Tabla general de historias de usuario**

| HU | Épica | Clasificación | Prioridad | Estim. | Estado actual |
| :---- | :---- | :---- | :---- | :---- | :---- |
| HU-01 | EP-01 | Núcleo | Alta | 8 | En desarrollo (backend completo; frontend con login funcional) |
| HU-02 | EP-02 | Núcleo | Alta | 5 | Pendiente |
| HU-03 | EP-02 | Núcleo | Alta | 8 | Pendiente |
| HU-04 | EP-02 | Núcleo | Media | 5 | Pendiente |
| HU-05 | EP-04 | Núcleo | Alta | 5 | Pendiente |
| HU-06 | EP-03 | Núcleo | Alta | 5 | En desarrollo (perfil de prestador construido; panel admin pendiente) |
| HU-07 | EP-04 | Núcleo | Alta | 8 | Pendiente |
| HU-08 | EP-03 | Núcleo | Media | 5 | Pendiente |
| HU-09 | EP-05 | Núcleo | Alta | 8 | Pendiente |
| HU-10 | EP-05 | Núcleo | Media | 5 | Pendiente |
| HU-11 | EP-06 | Núcleo | Baja | 3 | Pendiente |
| HU-12 | EP-06 | Núcleo | Media | 5 | Pendiente (scaffold Vite+React ya creado) |
| HU-13 | EP-04 | Núcleo | Alta | 5 | Pendiente |
| HU-14 | EP-04 | Núcleo | Alta | 5 | Pendiente |
| HU-15 | EP-04 | Extendido | Baja | 8 | Pendiente |
| HU-16 | EP-03 | Núcleo | Media | 3 | Pendiente |
| HU-17 | EP-01 | Núcleo | Media | 3 | Pendiente |
| HU-18 | EP-03 | Núcleo | Media | 3 | Pendiente |
| HU-19 | EP-03 | Núcleo | Baja | 3 | Pendiente |

*Estimaciones en puntos de historia (escala tipo Fibonacci). El estado refleja el avance del backend/frontend reportado a la fecha de este documento.*

# **4\. Historias de usuario — detalle y criterios de aceptación**

### **HU-01 — Registro e inicio de sesión con 3 roles**

**Épica:** EP-01   **Clasificación:** Núcleo garantizado

Historia: Como usuario, quiero registrarme e iniciar sesión como cliente, prestador o administrador, para acceder a las funcionalidades correspondientes a mi rol.

Precondición: El usuario no tiene una sesión activa.

Regla de negocio: Las contraseñas se almacenan con bcrypt, costo mínimo 10; el token JWT expira en 1 hora.

* Dado que un usuario nuevo completa el formulario de registro con datos válidos, cuando envía el formulario, entonces el sistema crea la cuenta y responde con un token JWT.

* Dado que un usuario ingresa credenciales inválidas, cuando intenta iniciar sesión, entonces el sistema responde con un mensaje de error genérico, sin indicar si el correo o la contraseña fue el dato incorrecto.

### **HU-02 — Publicación de solicitud de servicio con geolocalización**

**Épica:** EP-02   **Clasificación:** Núcleo garantizado

Historia: Como cliente, quiero publicar una solicitud de servicio indicando mi ubicación real, para que los prestadores cercanos puedan verla y ofertar.

Precondición: El cliente tiene sesión activa y ha concedido permiso de geolocalización al navegador.

* Dado que un cliente autenticado completa los datos de la solicitud (tipo de oficio, descripción, ubicación), cuando la publica, entonces la solicitud queda visible para los prestadores dentro del radio configurado.

* Dado que el cliente no concede el permiso de geolocalización, cuando intenta publicar una solicitud, entonces el sistema le solicita habilitar la ubicación antes de continuar.

### **HU-03 — Búsqueda de prestadores por radio de cercanía**

**Épica:** EP-02   **Clasificación:** Núcleo garantizado

Historia: Como sistema, quiero calcular qué prestadores están dentro de un radio determinado de la solicitud, usando la fórmula de Haversine, para notificarles únicamente a ellos.

Precondición: Existen prestadores aprobados con ubicación registrada.

Regla de negocio: El tiempo de respuesta de la búsqueda debe ser menor a 2 segundos para un radio de 5 km (RNF).

* Dado que se publica una nueva solicitud, cuando el sistema ejecuta la búsqueda por radio, entonces devuelve únicamente los prestadores aprobados y disponibles dentro del radio configurado.

* Dado que no existen prestadores dentro del radio, cuando se ejecuta la búsqueda, entonces el sistema informa al cliente que no hay prestadores disponibles cerca.

### **HU-04 — Notificación a prestadores cercanos**

**Épica:** EP-02   **Clasificación:** Núcleo garantizado

Historia: Como prestador, quiero recibir una notificación cuando se publica una solicitud dentro de mi radio de cobertura, para poder ofertar oportunamente.

Precondición: El prestador está en estado "disponible" y dentro del radio calculado por HU-03.

* Dado que un prestador disponible está dentro del radio de una nueva solicitud, cuando esta se publica, entonces el prestador recibe una notificación dentro de la plataforma.

* Dado que un prestador está en estado "no disponible", cuando se publica una solicitud dentro de su radio, entonces no recibe la notificación.

### **HU-05 — Envío de una oferta sobre una solicitud**

**Épica:** EP-04   **Clasificación:** Núcleo garantizado

Historia: Como prestador, quiero enviar una oferta sobre una solicitud de servicio, para ser considerado por el cliente.

Precondición: El prestador está aprobado y la solicitud sigue abierta (sin oferta aceptada).

* Dado que un prestador aprobado envía una oferta sobre una solicitud abierta, cuando la envía, entonces la oferta queda asociada a la solicitud y visible para el cliente.

* Dado que la solicitud ya tiene una oferta aceptada, cuando un prestador intenta ofertar, entonces el sistema rechaza el envío indicando que la solicitud ya fue cerrada.

### **HU-06 — Aprobación o rechazo de prestadores**

**Épica:** EP-03   **Clasificación:** Núcleo garantizado

Historia: Como administrador, quiero revisar, aprobar o rechazar el perfil de un prestador nuevo, para garantizar que solo prestadores validados puedan ofertar en la plataforma.

Precondición: Existe un perfil de prestador en estado "pendiente".

Regla de negocio: RN-12: un prestador no aprobado no puede enviar ofertas ni aparecer en las búsquedas por radio.

* Dado que existe un prestador en estado pendiente, cuando el administrador lo aprueba, entonces su estado cambia a "aprobado" y puede empezar a recibir solicitudes y ofertar.

* Dado que un administrador rechaza a un prestador, cuando ejecuta la acción, entonces el estado cambia a "rechazado" y el prestador no puede ofertar ni ser encontrado en búsquedas.

### **HU-07 — Envío de oferta con validación de reglas de negocio**

**Épica:** EP-04   **Clasificación:** Núcleo garantizado

Historia: Como prestador, quiero que el sistema valide mi límite de ofertas pendientes antes de permitirme enviar una nueva, para respetar las reglas de la plataforma.

Precondición: El prestador está aprobado.

Regla de negocio: RN-12: un prestador no puede tener más de N ofertas pendientes simultáneas (límite configurable).

* Dado que un prestador tiene menos ofertas pendientes que el límite permitido, cuando envía una nueva oferta, entonces el sistema la acepta y la asocia a la solicitud.

* Dado que un prestador alcanzó el límite de ofertas pendientes, cuando intenta enviar una nueva oferta, entonces el sistema la rechaza indicando que debe esperar a que se resuelvan sus ofertas actuales.

### **HU-08 — Gestión de los estados del prestador**

**Épica:** EP-03   **Clasificación:** Núcleo garantizado

Historia: Como prestador, quiero cambiar mi estado entre Disponible, No disponible y En servicio, para reflejar mi disponibilidad real ante nuevas solicitudes.

Precondición: El prestador está aprobado.

Regla de negocio: Un prestador "En servicio" no recibe nuevas notificaciones de solicitudes (HU-04) hasta finalizar el servicio en curso.

* Dado que un prestador aprobado cambia su estado a "No disponible", cuando lo hace, entonces deja de recibir notificaciones de nuevas solicitudes (HU-04).

* Dado que un prestador acepta una oferta (HU-14), cuando el servicio inicia, entonces su estado cambia automáticamente a "En servicio".

### **HU-09 — Pago de suscripción mensual**

**Épica:** EP-05   **Clasificación:** Núcleo garantizado

Historia: Como prestador, quiero pagar una suscripción mensual mediante una pasarela de pago sandbox, para mantener mi cuenta activa y poder seguir ofertando.

Precondición: El prestador está aprobado.

Regla de negocio: RN-12: la suscripción activa se calcula en tiempo de consulta a partir de period\_start/period\_end en la tabla payments.

* Dado que un prestador aprobado realiza el pago de su suscripción mensual en modo sandbox, cuando el pago se confirma, entonces su periodo de suscripción activa se actualiza en el sistema.

* Dado que la suscripción de un prestador venció y no fue renovada, cuando intenta enviar una nueva oferta, entonces el sistema la rechaza indicando que debe renovar su suscripción.

### **HU-10 — Auditoría de acciones administrativas críticas**

**Épica:** EP-05   **Clasificación:** Núcleo garantizado

Historia: Como administrador, quiero que las acciones administrativas críticas queden registradas de forma inmutable, para poder auditarlas por fecha y usuario responsable.

Precondición: Se ejecuta una acción administrativa (aprobar, rechazar, suspender, bloquear o eliminar un perfil).

Regla de negocio: El registro en audit\_logs es de solo lectura una vez creado (no editable ni eliminable).

* Dado que un administrador ejecuta una acción crítica (por ejemplo aprobar o suspender un prestador), cuando la acción se completa, entonces queda un registro en audit\_logs con fecha, administrador responsable y detalle de la acción.

* Dado que existe un historial de auditoría, cuando el administrador filtra por fecha o por usuario, entonces el sistema muestra únicamente los registros que coinciden con el filtro.

### **HU-11 — Notificaciones básicas dentro de la plataforma**

**Épica:** EP-06   **Clasificación:** Núcleo garantizado

Historia: Como usuario (cliente o prestador), quiero recibir notificaciones dentro de la plataforma sobre eventos relevantes (nueva oferta, oferta aceptada, cambio de estado), para mantenerme informado sin salir del sistema.

Precondición: El usuario tiene sesión activa.

* Dado que ocurre un evento relevante para un usuario (por ejemplo, recibe una nueva oferta), cuando el usuario abre la plataforma, entonces ve la notificación correspondiente.

* Dado que un usuario marca una notificación como leída, cuando lo hace, entonces esta deja de aparecer como pendiente.

### **HU-12 — Progressive Web App (manifest y service worker)**

**Épica:** EP-06   **Clasificación:** Núcleo garantizado

Historia: Como usuario, quiero poder instalar GeoServi-App en mi dispositivo como una aplicación, para acceder a ella sin depender del navegador abierto.

Precondición: El frontend cuenta con un manifest.json válido y un service worker registrado.

Regla de negocio: RNF: compatibilidad con Chrome y Edge, en escritorio y en dispositivos Android.

* Dado que un usuario visita GeoServi-App desde Chrome en Android, cuando el navegador detecta el manifest y el service worker, entonces ofrece la opción de instalar la aplicación.

* Dado que la aplicación fue instalada, cuando el usuario la abre sin conexión, entonces al menos la interfaz básica (shell de la app) carga correctamente.

### **HU-13 — Finalización de servicio con evidencia fotográfica**

**Épica:** EP-04   **Clasificación:** Núcleo garantizado

Historia: Como prestador, quiero finalizar un servicio adjuntando una evidencia fotográfica (JPG), para dejar constancia de que el trabajo fue completado.

Precondición: El servicio está en estado "En servicio" (oferta aceptada, HU-14).

* Dado que un prestador tiene un servicio en curso, cuando lo marca como finalizado y adjunta una foto en formato JPG, entonces el sistema registra la finalización con la evidencia asociada.

* Dado que un prestador intenta finalizar un servicio sin adjuntar evidencia, cuando lo intenta, entonces el sistema rechaza la acción y solicita la foto.

### **HU-14 — Aceptación de oferta y transición de estado**

**Épica:** EP-04   **Clasificación:** Núcleo garantizado

Historia: Como cliente, quiero aceptar una de las ofertas recibidas sobre mi solicitud, para contratar formalmente a un prestador.

Precondición: La solicitud tiene al menos una oferta pendiente.

* Dado que un cliente tiene una o más ofertas pendientes sobre su solicitud, cuando acepta una de ellas, entonces esa oferta pasa a estado "aceptada", las demás se marcan como "rechazadas automáticamente", y el prestador aceptado cambia su estado a "En servicio" (HU-08).

* Dado que una solicitud ya tiene una oferta aceptada, cuando el cliente intenta aceptar otra oferta sobre la misma solicitud, entonces el sistema rechaza la acción.

### **HU-15 — Mensajería en tiempo real cliente-prestador**

**Épica:** EP-04   **Clasificación:** Alcance extendido

Historia: Como cliente o prestador, quiero enviar y recibir mensajes en tiempo real una vez existe al menos una oferta enviada sobre mi solicitud, para coordinar los detalles del servicio.

Precondición: Existe al menos una oferta activa entre el cliente y el prestador.

Regla de negocio: RN-13: el canal de mensajería solo se habilita entre las dos partes de una oferta activa y se cierra al finalizar o cancelar el servicio.

* Dado que existe una oferta activa entre un cliente y un prestador, cuando cualquiera de los dos abre el canal, entonces puede enviar y recibir mensajes en tiempo real vía Socket.io.

* Dado que el servicio fue finalizado, cuando cualquiera de los participantes intenta enviar un nuevo mensaje, entonces el sistema rechaza el envío indicando que el canal fue cerrado.

### **HU-16 — Suspensión y reactivación de prestador**

**Épica:** EP-03   **Clasificación:** Núcleo garantizado

Historia: Como administrador, quiero suspender temporalmente a un prestador aprobado, para impedir que reciba u ofrezca servicios mientras se resuelve una incidencia, sin eliminar su cuenta.

Precondición: El prestador está en estado "aprobado".

Regla de negocio: RN-14: un prestador suspendido no puede enviar ofertas ni recibir solicitudes; la acción queda registrada en audit\_logs (HU-10).

* Dado que un prestador está aprobado, cuando el administrador lo suspende indicando un motivo, entonces su estado cambia a "suspendido" y queda registrado en audit\_logs.

* Dado que un prestador suspendido es reactivado por el administrador, cuando esto ocurre, entonces su estado vuelve a "aprobado" y la reactivación también se audita.

### **HU-17 — Baja voluntaria de cuenta**

**Épica:** EP-01   **Clasificación:** Núcleo garantizado

Historia: Como cliente o prestador, quiero darme de baja de la plataforma por mi propia decisión, para dejar de estar visible/activo cuando ya no deseo usar el servicio.

Precondición: El usuario tiene sesión activa.

Regla de negocio: RN-15: la baja voluntaria equivale a un bloqueo de la propia cuenta; el historial se conserva íntegro.

* Dado que un usuario confirma la baja de su cuenta, cuando el sistema la procesa, entonces su estado pasa a "inactivo por baja voluntaria" y su sesión se cierra.

* Dado que un usuario dado de baja intenta iniciar sesión, cuando lo hace, entonces el sistema rechaza el acceso indicando que la cuenta está inactiva.

### **HU-18 — Bloqueo permanente de perfil por el administrador**

**Épica:** EP-03   **Clasificación:** Núcleo garantizado

Historia: Como administrador, quiero bloquear permanentemente el perfil de un cliente o prestador, para impedir su acceso cuando su conducta lo amerite, conservando su historial.

Precondición: El usuario objetivo existe en el sistema.

Regla de negocio: RN-16: el bloqueo es un soft delete; el historial permanece intacto y la acción se audita (HU-10).

* Dado que el administrador bloquea un perfil indicando un motivo, cuando ejecuta la acción, entonces el estado de la cuenta cambia a "bloqueado" y queda registrado en audit\_logs.

* Dado que un perfil está bloqueado, cuando su usuario intenta iniciar sesión, entonces el sistema rechaza el acceso con un mensaje genérico.

### **HU-19 — Eliminación física de perfil sin actividad histórica**

**Épica:** EP-03   **Clasificación:** Núcleo garantizado

Historia: Como administrador, quiero eliminar físicamente el perfil de un usuario sin actividad asociada, para depurar cuentas de prueba, duplicadas o creadas por error.

Precondición: El perfil no tiene registros asociados en service\_requests, offers, ratings ni payments.

Regla de negocio: RN-17: si el perfil tiene actividad histórica, el sistema rechaza el borrado físico y sugiere usar el bloqueo (HU-18).

* Dado que un perfil no tiene actividad asociada, cuando el administrador lo elimina físicamente, entonces el registro se borra de la tabla users y la acción se audita.

* Dado que un perfil sí tiene actividad histórica, cuando el administrador intenta eliminarlo físicamente, entonces el sistema rechaza la acción y sugiere el bloqueo permanente en su lugar.

# **5\. Reglas de negocio consolidadas**

| Regla | Descripción |
| :---- | :---- |
| RN-12 | Un prestador solo puede ofertar si está aprobado, tiene suscripción activa y no supera el límite de ofertas pendientes simultáneas. |
| RN-13 | El canal de mensajería en tiempo real (HU-15) solo se habilita entre las partes de una oferta activa y se cierra al finalizar o cancelar el servicio. |
| RN-14 | Un prestador suspendido (HU-16) no puede enviar ofertas ni recibir solicitudes mientras dure la suspensión. |
| RN-15 | La baja voluntaria (HU-17) equivale a un bloqueo de la propia cuenta; el historial del usuario se conserva. |
| RN-16 | El bloqueo administrativo (HU-18) es un soft delete: el registro y su historial permanecen intactos. |
| RN-17 | La eliminación física (HU-19) solo se permite si el perfil no tiene actividad histórica asociada. |

*Las reglas de negocio RN-01 a RN-09, referidas a los flujos de publicación, notificación y aceptación de ofertas, se detallan en el documento "Casos de Uso y Escenarios v1.1".*

# **6\. Dependencias entre historias**

| Historia | Depende de |
| :---- | :---- |
| HU-04 | HU-02 (existe la solicitud), HU-03 (radio calculado) |
| HU-05 | HU-01 (autenticación), HU-04 (notificación recibida) |
| HU-06 | HU-01 (registro del prestador) |
| HU-07 | HU-05, HU-06 (prestador aprobado) |
| HU-08 | HU-06, HU-14 (transición al aceptar oferta) |
| HU-09 | HU-06 (prestador aprobado) |
| HU-13 | HU-14 (oferta aceptada, servicio en curso) |
| HU-14 | HU-07 (existen ofertas sobre la solicitud) |
| HU-15 | HU-07 o HU-14 (existe al menos una oferta activa) |
| HU-16 | HU-06 (el prestador debe estar aprobado) |
| HU-17 | HU-01 (sesión activa) |
| HU-18 | HU-01 (el perfil debe existir) |
| HU-19 | HU-18 (regla de restricción compartida sobre actividad histórica) |

# **7\. Definición de Terminado (Definition of Done)**

* El código de la historia está implementado, comentado y integrado en la rama principal del repositorio.

* Los criterios de aceptación (Given/When/Then) de la historia se cumplen y fueron verificados manualmente.

* Las reglas de negocio asociadas están validadas en el backend, no solo en el frontend.

* Las acciones administrativas críticas relacionadas quedan registradas en audit\_logs (cuando aplica, según HU-10).

* No se introducen errores 500 no controlados; los errores de validación devuelven códigos y mensajes claros (400/401/403/404).

* La funcionalidad fue probada end-to-end entre frontend y backend, no solo mediante pruebas de API aisladas.

# **8\. Casos de uso críticos**

El detalle completo de actores, flujos alternativos, escenarios Given/When/Then y diagramas UML de los siguientes casos de uso críticos se encuentra en el documento "Casos de Uso y Escenarios v1.1":

| Caso de uso | Historia asociada | Actor principal |
| :---- | :---- | :---- |
| CU-07 | Enviar oferta sobre una solicitud (HU-07) | Prestador |
| CU-01 | Aceptar oferta (HU-14) | Cliente |
| CU-13 | Finalizar servicio con evidencia (HU-13) | Prestador |

# **9\. Explícitamente fuera de alcance**

* Notificaciones push nativas (Capacitor queda documentado como posible evolución futura).

* Acceso a cámara mediante SDK nativo.

* Recuperación de contraseña autogestionada.

* Edición o desactivación de servicios ya publicados.

* Cancelación de solicitudes ya publicadas.

*Documento consolidado a partir de la Formulación y Constitución v5.1, el Addendum de Resolución de Incoherencias v1.0 y la Ampliación de Alcance v1.0 (Gestión de Cuentas) del proyecto GeoServi-App.*