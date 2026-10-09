# Flujo de trabajo — GeoServi-App

Equipo de 2 personas, proyecto de grado ADSO-SENA. Este documento define cómo
trabajamos con Git/GitHub para que el historial quede limpio y trazable hasta
la sustentación.

## 1. Estrategia de ramas

Usamos un **GitHub Flow simplificado** (no Git Flow completo — con 2 personas
y un proyecto de ~3 meses, una rama `develop` extra solo añade fricción sin
beneficio real).

```
main                    ← siempre debe poder correr (npm run dev sin errores)
 └── feature/HU-03-busqueda-haversine
 └── feature/HU-05-ofertas-limite
 └── fix/race-condition-email-register
 └── chore/setup-eslint
```

**Regla de oro:** nunca se hace `git push` directo a `main`. Todo entra por
Pull Request, aunque sean solo ustedes dos — así queda el historial de qué
HU introdujo qué cambio, útil para la sustentación y para los documentos
UML/BPMN que ya tienen.

### Convención de nombres de rama

| Prefijo | Cuándo usarlo | Ejemplo |
|---|---|---|
| `feature/` | Nueva funcionalidad, ligada a una HU | `feature/HU-04-notificar-prestadores` |
| `fix/` | Corrección de bug | `fix/HU-03-radio-negativo` |
| `chore/` | Tooling, config, dependencias | `chore/eslint-config` |
| `docs/` | Solo documentación | `docs/actualizar-adr-001` |

## 2. Convención de commits (Conventional Commits)

```
<tipo>(<alcance opcional>): <mensaje en presente, breve>

Ejemplos:
feat(requests): agregar endpoint POST /requests (HU-02)
feat(providers): búsqueda por radio con Haversine (HU-03)
fix(auth): corregir condición de carrera en validación de email
docs(readme): actualizar estado de avance al 2026-10-09
chore(db): agregar migración 001_account_status
```

Tipos válidos: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`.

## 3. Pull Requests

1. Crea la rama desde `main` actualizado: `git checkout main && git pull && git checkout -b feature/HU-XX-nombre`
2. Commits pequeños y descriptivos mientras avanzas.
3. `git push -u origin feature/HU-XX-nombre`
4. Abre el PR en GitHub. En la descripción, incluye `Closes #<número del issue>`
   — así el issue se cierra solo al mergear.
5. El otro compañero revisa (aunque sea rápido) antes de aprobar.
6. Merge a `main` → borra la rama.

## 4. Relación con los documentos del proyecto

Cada issue en GitHub debe mapear a una HU numerada del **Backlog v3.0**
(o a una tarea técnica explícita del README de avance). Si surge trabajo que
no encaja en ninguna HU existente, primero se formaliza como HU en el backlog
(como ya hicieron con el Addendum para HU-15/HU-16) y luego se crea el issue
— así el código nunca va por delante de la documentación oficial.