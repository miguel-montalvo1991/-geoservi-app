**SERVICIO NACIONAL DE APRENDIZAJE \- SENA**

Análisis y Desarrollo de Software (ADSO) — Ficha 3229209

**Proyecto de grado: GeoServi-App (ECOMIBARRIO)**

**Ampliación de Alcance v1.0 — Gestión de Cuentas de Usuario**

Este documento formaliza tres historias de usuario nuevas, todas clasificadas dentro del núcleo garantizado, referidas al ciclo de vida de las cuentas de cliente y prestador: baja voluntaria por el propio usuario, y bloqueo o eliminación de un perfil por parte del administrador. Con esta ampliación, el núcleo garantizado del proyecto pasa de 15 a 18 historias de usuario (HU-01 a HU-14, HU-16, HU-17, HU-18 y HU-19).

# **1\. Resumen**

| HU | Nombre | Actor principal | Clasificación |
| :---- | :---- | :---- | :---- |
| HU-17 | Baja voluntaria de cuenta | Cliente / Prestador | Núcleo garantizado |
| HU-18 | Bloqueo permanente de perfil (soft delete) | Administrador | Núcleo garantizado |
| HU-19 | Eliminación física de perfil | Administrador | Núcleo garantizado |

# **2\. HU-17 — Baja voluntaria de cuenta**

| Épica | EP-01 Autenticación y gestión de cuenta (ampliada) |
| :---- | :---- |
| Historia | Como cliente o prestador, quiero poder darme de baja de la plataforma por mi propia decisión, para dejar de estar visible/activo en el sistema cuando ya no deseo usar el servicio. |
| Precondiciones | El usuario tiene una sesión activa y autenticada. |
| Reglas de negocio | RN-15 (nueva): la baja voluntaria equivale a un bloqueo de la propia cuenta (mismo mecanismo que HU-18): el usuario pierde acceso y deja de ser visible en búsquedas o notificaciones, pero su historial (solicitudes, ofertas, calificaciones, pagos) se conserva íntegro para no romper la trazabilidad del sistema. Si el prestador tiene una suscripción activa, la baja no genera reembolso automático. |
| Postcondiciones | El estado de la cuenta pasa a "inactivo por baja voluntaria"; el usuario no puede volver a iniciar sesión sin gestionar una reactivación manual con el administrador. |

### **Criterios de aceptación**

* Dado que un cliente o prestador tiene sesión activa, cuando confirma la acción de darse de baja, entonces su cuenta pasa a estado inactivo, se cierra su sesión y deja de aparecer en búsquedas o listados de prestadores disponibles.

* Dado que un prestador con suscripción activa se da de baja, cuando el sistema procesa la baja, entonces la suscripción no se cancela automáticamente en la pasarela de pago y esto se le informa explícitamente al usuario antes de confirmar.

* Dado que un usuario dado de baja intenta iniciar sesión, cuando ingresa sus credenciales, entonces el sistema rechaza el acceso indicando que la cuenta está inactiva.

# **3\. HU-18 — Bloqueo permanente de perfil por el administrador**

| Épica | EP-03 Perfiles y gobernanza de cuentas (ampliada) |
| :---- | :---- |
| Historias relacionadas | HU-06, HU-10, HU-16 (la suspensión de HU-16 es temporal y solo aplica a prestadores; el bloqueo de HU-18 es permanente y aplica a cualquier perfil, cliente o prestador) |
| Historia | Como administrador, quiero poder bloquear permanentemente el perfil de un cliente o de un prestador, para impedir su acceso al sistema cuando su conducta lo amerite, conservando el historial asociado a su cuenta. |
| Precondiciones | El usuario objetivo existe en el sistema. Solo un administrador puede ejecutar la acción. |
| Reglas de negocio | RN-16 (nueva): el bloqueo es un soft delete — el registro del usuario y todo su historial (solicitudes, ofertas, calificaciones, pagos) permanecen intactos en la base de datos, pero el usuario no puede autenticarse ni aparecer en búsquedas. La acción queda registrada en audit\_logs conforme a HU-10. |
| Postcondiciones | El estado de la cuenta pasa a "bloqueado"; el motivo, la fecha y el administrador responsable quedan registrados en el log de auditoría. |

### **Criterios de aceptación**

* Dado que el administrador selecciona un perfil (cliente o prestador) e ingresa un motivo, cuando ejecuta la acción de bloquear, entonces el estado de la cuenta cambia a "bloqueado" y queda registrado en audit\_logs.

* Dado que un perfil está bloqueado, cuando su usuario intenta iniciar sesión, entonces el sistema rechaza el acceso con un mensaje genérico, sin revelar el motivo del bloqueo.

* Dado que un perfil está bloqueado, cuando el administrador consulta el historial de ese usuario, entonces todas sus solicitudes, ofertas, calificaciones y pagos previos siguen siendo visibles y consistentes.

# **4\. HU-19 — Eliminación física de perfil por el administrador**

| Épica | EP-03 Perfiles y gobernanza de cuentas (ampliada) |
| :---- | :---- |
| Historia | Como administrador, quiero poder eliminar físicamente el perfil de un cliente o prestador cuando no tiene actividad histórica asociada, para depurar cuentas de prueba, duplicadas o creadas por error. |
| Precondiciones | El perfil objetivo no tiene registros asociados en service\_requests, offers, ratings ni payments. Solo un administrador puede ejecutar la acción. |
| Reglas de negocio | RN-17 (nueva): la eliminación física está restringida a perfiles sin actividad histórica, para no romper la integridad referencial ni el historial de auditoría (HU-10). Si el perfil tiene actividad asociada, el sistema rechaza el borrado físico y sugiere usar el bloqueo (HU-18) en su lugar. La eliminación exitosa también se registra en audit\_logs, incluyendo los datos básicos del perfil eliminado (para trazabilidad de la acción administrativa, aunque el registro original ya no exista). |
| Postcondiciones | La fila del usuario se elimina permanentemente de la tabla users; la acción queda registrada en audit\_logs. |

### **Criterios de aceptación**

* Dado que un perfil no tiene ninguna solicitud, oferta, calificación ni pago asociado, cuando el administrador ejecuta la eliminación física, entonces el registro se borra permanentemente de la base de datos y la acción queda registrada en audit\_logs.

* Dado que un perfil sí tiene actividad histórica asociada, cuando el administrador intenta eliminarlo físicamente, entonces el sistema rechaza la acción e indica que debe usar el bloqueo permanente (HU-18) en su lugar.

* Dado que la eliminación física fue exitosa, cuando el administrador consulta el log de auditoría, entonces puede ver qué perfil fue eliminado, cuándo y por quién, aunque el registro original del usuario ya no exista en la tabla users.

# **5\. Impacto en documentos y modelo de datos**

* Backlog: agregar HU-17, HU-18 y HU-19 a la tabla general; el núcleo garantizado pasa de 15 a 18 historias.

* Formulación y Constitución v5.0: se recomienda una revisión v5.1 que incorpore estas tres historias en las secciones de alcance y épicas.

* Épica EP-01: se sugiere renombrarla de "Autenticación" a "Autenticación y gestión de cuenta" para reflejar que ahora incluye HU-17.

* Épica EP-03: se sugiere renombrarla de "Perfiles y aprobación de prestadores" a "Perfiles y gobernanza de cuentas", ya que HU-18 y HU-19 aplican tanto a clientes como a prestadores, no solo a prestadores.

* Modelo de datos: la tabla users requiere un campo de estado (por ejemplo account\_status: activo / inactivo\_baja / bloqueado) para soportar HU-17 y HU-18 sin necesidad de borrar filas.

*Documento generado como ampliación de alcance del proyecto de grado GeoServi-App, posterior a la Formulación y Constitución v5.0.*