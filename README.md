# SAIYAGYM

Sistema web para la gestión de gimnasios (proyecto universitario de Ingeniería de Sistemas).

**Arquitectura de tres capas:** React (Vite) → API REST con Express → PostgreSQL.

## Alcance implementado

| Sprint | Módulo | Historias |
|---|---|---|
| 1 | Gestión de usuarios | E1-HU1 Registrar · E1-HU2 Consultar/buscar · E1-HU3 Actualizar · E1-HU4 Gestionar estado |
| 2 | Gestión de rutinas | E2-HU1 Crear · E2-HU2 Asignar · E2-HU3 Modificar · E2-HU4 Consultar rutina asignada |

Pagos, membresías, asistencia y rachas (Sprints 3 a 5) **no** están incluidos.

## Estructura

```
SAIYAGYM/
├── frontend/    React + Vite (interfaz)
│   └── src/
│       ├── pages/        UsuariosPage, RutinasPage, MiRutinaPage
│       ├── components/   Mensaje, DetalleRutina
│       └── services/     api.js (única capa que habla con el backend)
├── backend/     Node.js + Express (API REST)
│   ├── src/
│   │   ├── routes/        URLs de la API
│   │   ├── controllers/   reciben la petición y arman la respuesta
│   │   ├── services/      reglas de negocio y validaciones
│   │   ├── repositories/  consultas SQL parametrizadas
│   │   ├── middleware/    manejo central de errores
│   │   └── config/        variables de entorno y conexión a PostgreSQL
│   └── scripts/init-db.js crea la base de datos y las tablas
├── database/
│   ├── schema.sql   tablas, claves, restricciones
│   └── seed.sql     datos de ejemplo (opcional)
└── README.md
```

## Requisitos

- Node.js 20 o superior
- PostgreSQL 14 o superior (con el servicio iniciado) y la contraseña del usuario `postgres`

## Puesta en marcha (Windows / PowerShell)

Usa **dos terminales**: una para el backend y otra para el frontend.

### 1. Backend (terminal 1)

```powershell
cd backend
copy .env.example .env
```

Abre `backend\.env` y escribe tu contraseña real de PostgreSQL en `DB_PASSWORD`. Luego:

```powershell
npm.cmd install
npm.cmd run db:init
npm.cmd run db:seed
npm.cmd run dev
```

- `db:init` crea la base `saiyagym` (si no existe) y las tablas. Se puede repetir sin perder datos.
- `db:seed` es **opcional**: agrega 4 usuarios de ejemplo (un administrador, un entrenador y dos usuarios).
- Debe aparecer: `API de SAIYAGYM escuchando en http://localhost:3000` y `Conectado a PostgreSQL`.

### 2. Frontend (terminal 2)

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Abre http://localhost:5173/

### Flujo sugerido para probar

1. **Usuarios** (Administrador): registra un usuario con rol *Entrenador* y otro con rol *Usuario*.
2. **Rutinas** (Entrenador): crea una rutina con ejercicios, modifícala y asígnala al usuario.
3. **Mi rutina** (Usuario): elige al usuario y consulta su rutina.

## API REST

Respuestas exitosas: `{ "ok": true, "data": ..., "mensaje": "..." }`
Errores: `{ "ok": false, "error": { "codigo": "...", "mensaje": "...", "campos": [] } }`

| Método | Ruta | Historia |
|---|---|---|
| POST | `/api/usuarios` | E1-HU1 registrar |
| GET | `/api/usuarios?buscar=&rol=&estado=` | E1-HU2 consultar / buscar |
| GET | `/api/usuarios/:id` | consultar un usuario |
| PUT | `/api/usuarios/:id` | E1-HU3 actualizar |
| PATCH | `/api/usuarios/:id/estado` | E1-HU4 activar / inactivar (`{ "estado": "Activo" \| "Inactivo" }`) |
| POST | `/api/rutinas` | E2-HU1 crear rutina |
| GET | `/api/rutinas` · `/api/rutinas/:id` | listar / consultar |
| PUT | `/api/rutinas/:id` | E2-HU3 modificar rutina |
| POST | `/api/asignaciones` | E2-HU2 asignar (`{ "usuario_id", "rutina_id" }`) |
| GET | `/api/usuarios/:id/rutina` | E2-HU4 rutina asignada |
| GET | `/api/salud` | comprueba API y base de datos |

## Decisiones de diseño y supuestos

- **Rol en el registro:** E1-HU1 pide registrar "datos personales y su rol". Se usó una sola tabla `usuarios` con el campo `rol` (`administrador`, `entrenador`, `usuario`).
- **Búsqueda (E1-HU2):** el listado muestra todos los usuarios; con el botón *Buscar* se filtra por nombre o documento. Si el criterio está vacío, la API responde pidiendo el dato (criterio de aceptación 3).
- **Inicio de sesión:** ninguna historia de los Sprints 1 y 2 lo construye, aunque los criterios lo mencionan como contexto. Por eso los módulos son accesibles desde la barra superior y "Mi rutina" permite elegir al usuario. Cuando se implemente la autenticación, este selector se reemplaza por el usuario autenticado.
- **Ejercicios de una rutina:** se escriben libremente (nombre, series, repeticiones); no se creó un catálogo de ejercicios porque ninguna historia lo pide.
- **Una rutina vigente por usuario:** al asignar una nueva, la anterior queda en el historial (`asignaciones_rutina.vigente = false`).
- **Rutina "no disponible" (E2-HU4, escenario 3):** la columna `rutinas.estado` (`Activa`/`Inactiva`) existe y la API la respeta; no hay pantalla para inactivar rutinas porque ninguna historia lo solicita.
- **Documentos:** se guardan en mayúsculas (4 a 20 letras o números) para evitar duplicados como `ab123` y `AB123`.
- **Seguridad:** consultas SQL parametrizadas, credenciales solo en `backend/.env` (excluido de Git), mensajes de error internos sin detalles técnicos.

## Solución de problemas

| Mensaje | Causa y solución |
|---|---|
| `Usuario o contraseña de PostgreSQL incorrectos` | Revisa `DB_USER` y `DB_PASSWORD` en `backend\.env`. |
| `No se pudo conectar a PostgreSQL en localhost:5432` | El servicio de PostgreSQL no está iniciado (Servicios de Windows → `postgresql-x64-XX`). |
| `El puerto 3000 ya está en uso` | Cierra el otro programa o cambia `PORT` en `backend\.env` (y el destino del proxy en `frontend\vite.config.js`). |
| En la web: "No se pudo conectar con el servidor" | El backend no está en ejecución: revisa la terminal 1. |
| PowerShell bloquea `npm` | Usa siempre `npm.cmd`. |
