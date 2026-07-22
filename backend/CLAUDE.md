# kitchen-backend

Backend Express montado sobre la librería propia **`sm-express-server`**, escrito en TypeScript, gestionado en local con **pm2**.

## Stack

- **Runtime**: Node 20, Yarn 4 (Berry, `nodeLinker: node-modules`).
- **Framework**: [`sm-express-server`](node_modules/sm-express-server) — wrapper propio sobre Express (no publica tipos, ver más abajo).
- **TypeScript**: 5.7.3. Se fijó esta versión a propósito porque `yarn add typescript` sin versión intenta resolver un parche interno roto (`typescript@7.0.2` vía `compat/typescript`) y falla con `ENOENT`.
- **Dev runner**: `tsx` (soporta los path-aliases de `tsconfig.json` de forma nativa, sin config extra).
- **Build**: `tsc` + `tsc-alias` (reescribe los alias `@/*` a rutas relativas en el JS de `dist/`, porque Node no entiende alias en runtime).
- **Proceso**: `pm2`, ya instalado globalmente por el usuario.

## Estructura

```
src/
  config/env.ts          # PORT, NODE_ENV, STATIC_DIR (via dotenv/config)
  controllers/            # handlers, envueltos con createController()
  routers/                # createRouter() por feature + index.router.ts que los agrega
  services/               # lógica de negocio, separada del controller
  types/sm-express-server.d.ts  # tipado ambiental propio de la librería (no lo trae ella)
  utils/logger.ts
  app.ts                  # instancia el Server de sm-express-server
  index.ts                # entrypoint, llama a server.start()
public/                   # carpeta estática que sirve el Server (2º arg del constructor)
dist/                     # build compilado (gitignored)
logs/                     # logs de pm2 (gitignored)
ecosystem.config.js       # config de pm2
tsconfig.json
.env.example
```

Patrón para añadir un recurso nuevo: `service` (lógica) → `controller` (usa `createController`) → `router` (usa `createRouter`, registra el controller en sus métodos) → añadirlo al array `routers` en `routers/index.router.ts`.

## Alias `@/`

`tsconfig.json` define `baseUrl: "src"` + `paths: {"@/*": ["*"]}`. Ejemplo: `@/services/health.service` → `src/services/health.service.ts`.

- En dev (`tsx`) se resuelve nativamente, sin nada extra.
- En build, `tsc` no reescribe los alias — por eso el script `build` encadena `tsc-alias` después de `tsc`, que convierte los `require("@/...")` del JS compilado en rutas relativas (`require("./...")`). Sin este paso, `dist/index.js` fallaría en runtime con `Cannot find module '@/...'`.

## `sm-express-server`: cómo funciona (sin tipos propios)

La librería es JS puro, sin `.d.ts`. Se le creó un tipado ambiental en [src/types/sm-express-server.d.ts](src/types/sm-express-server.d.ts) que cubre su API real (leída directamente del código fuente en `node_modules/sm-express-server/modules/`):

- `new Server(port, direction, use[], routers[], controllers[])` — `direction` es la carpeta que sirve `express.static` (usamos `./public`).
- `createRouter(path, cb)` → `{path, router}` (Router de Express normal por dentro).
- `createController(action)` → devuelve `action` tal cual (es solo un wrapper identidad), se puede usar directo como handler de Express.
- `createStorage(fileDirection)` → instancia de `multer` para subida de ficheros.
- `SocketIo` / `createSocketController` — soporte de sockets, no usado todavía en este proyecto.

**Decisión de diseño**: la librería también permite registrar rutas sueltas vía el array `controllers` del `Server` (formato `{method, path, storage, callback}`, donde `storage` se pasa siempre como middleware posicional aunque no haya upload — si no es una función, Express revienta). Para evitar esa fragilidad, en este proyecto **no se usa ese mecanismo**: todo pasa por `routers` + Express Router estándar. Si en el futuro hace falta subida de ficheros, se monta `createStorage(...).single("file")` como middleware normal dentro del router de esa feature.

## Variables de entorno

Definidas en [.env.example](.env.example) (copiar a `.env` para local sin pm2):

```
PORT=4001
NODE_ENV=development
STATIC_DIR=./public
```

`src/config/env.ts` las lee con fallback. Nota: `PORT=4001` porque el 4000 ya lo ocupa otra app del usuario corriendo en pm2 (`asystent`, ver `pm2 list`).

## pm2 (`ecosystem.config.js`)

Dos apps definidas, mismo puerto (4001) — **no correr las dos a la vez**, dan conflicto de puerto:

### `kitchen-backend` — modo estable/producción
- Corre `dist/index.js` (build compilado), `watch: false`.
- Hay que reconstruir (`yarn build`) y reiniciar manualmente tras cambios — o usar los scripts `pm2:*` de abajo, que ya encadenan el build.
- Logs: `logs/out.log` / `logs/error.log`.

### `kitchen-backend-dev` — modo desarrollo con auto-reload
- Corre el TypeScript **directo**, sin build: `script: "src/index.ts"`, `interpreter: "node_modules/.bin/tsx"`.
- `watch: ["src"]` — pm2 vigila la carpeta y **reinicia el proceso solo** en cada guardado (verificado: al tocar un archivo, `restarts` sube y el endpoint refleja el cambio en ~1s).
- `ignore_watch` excluye `node_modules`, `dist`, `logs`, `public`.
- Logs: `logs/dev-out.log` / `logs/dev-error.log`.

### Scripts (`package.json`)

```
yarn dev              # tsx watch, sin pm2 (para debug rápido fuera de pm2)
yarn build            # tsc + tsc-alias → dist/
yarn start            # node dist/index.js, sin pm2
yarn typecheck        # tsc --noEmit

yarn pm2:start        # build + pm2 start (solo kitchen-backend)
yarn pm2:start:prod   # build + pm2 start --env production (solo kitchen-backend)
yarn pm2:dev          # pm2 start (solo kitchen-backend-dev) — auto-reload
yarn pm2:restart      # build + pm2 restart (solo kitchen-backend)
yarn pm2:stop         # pm2 stop de todo lo definido en el ecosystem
yarn pm2:delete       # pm2 delete de todo lo definido en el ecosystem
yarn pm2:logs         # pm2 logs kitchen-backend
```

Para ver logs del modo dev: `pm2 logs kitchen-backend-dev`.

Tras arrancar/parar procesos con pm2 conviene `pm2 save` para que el dump persista (útil si el usuario tiene `pm2 resurrect`/startup configurado).

## Frontend

El proyecto hermano `../frontend` (antes `public`) es Vite + React + TS, independiente de este backend.
