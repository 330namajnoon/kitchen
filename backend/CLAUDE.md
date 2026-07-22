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
  config/env.ts          # PORT, NODE_ENV, STATIC_DIR, MARIADB_* (via dotenv/config)
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
docker-compose.yml        # servidor MariaDB local
prisma/schema.prisma      # esquema de la base de datos (fuente de verdad)
prisma/migrations/        # migraciones versionadas, generadas por Prisma
prisma.config.ts          # config de Prisma (lee DATABASE_URL)
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
- El `Server` monta `cors()` sin restricciones (`this.app.use(cors())`) antes de los routers, así
  que cualquier origen puede llamar a la API — el frontend (Vite, otro puerto) no necesita config
  extra ni proxy para consumirla en local.

**Decisión de diseño**: la librería también permite registrar rutas sueltas vía el array `controllers` del `Server` (formato `{method, path, storage, callback}`, donde `storage` se pasa siempre como middleware posicional aunque no haya upload — si no es una función, Express revienta). Para evitar esa fragilidad, en este proyecto **no se usa ese mecanismo**: todo pasa por `routers` + Express Router estándar. Si en el futuro hace falta subida de ficheros, se monta `createStorage(...).single("file")` como middleware normal dentro del router de esa feature.

## Variables de entorno

Definidas en [.env.example](.env.example) (copiar a `.env` para local sin pm2):

```
PORT=4001
NODE_ENV=development
STATIC_DIR=./public

# MariaDB (docker-compose.yml)
MARIADB_PORT=3306
MARIADB_DATABASE=kitchen
MARIADB_USER=kitchen
MARIADB_PASSWORD=kitchen
MARIADB_ROOT_PASSWORD=root
```

`src/config/env.ts` las lee con fallback (expuestas bajo `env.mariadb.*`). Nota: `PORT=4001` porque el 4000 ya lo ocupa otra app del usuario corriendo en pm2 (`asystent`, ver `pm2 list`).

Las mismas variables `MARIADB_*` están replicadas en los bloques `env` / `env_production` de `ecosystem.config.js` (pm2 no lee `.env` automáticamente, hay que declararlas ahí para que los procesos gestionados por pm2 las tengan).

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

## Base de datos (MariaDB vía Docker)

`docker-compose.yml` levanta un contenedor `mariadb:11` (`kitchen-mariadb`) con volumen persistente `mariadb-data`. Se eligió MariaDB sobre MySQL por ser 100% open-source (sin la licencia de Oracle), compatible con el protocolo/driver de MySQL y más ligera.

Credenciales por defecto (ver [Variables de entorno](#variables-de-entorno)): db `kitchen`, user/pass `kitchen`/`kitchen`, puerto `3306`.

```
docker compose up -d       # arrancar
docker compose down        # parar (mantiene datos)
docker compose down -v     # parar y borrar datos (¡destructivo!)
docker compose logs -f     # ver logs
```

Conexión manual: `mysql -h 127.0.0.1 -P 3306 -u kitchen -pkitchen kitchen`.

El usuario `kitchen` tiene `GRANT ALL PRIVILEGES ON *.*` (no solo sobre la db `kitchen`) porque Prisma Migrate necesita crear una shadow database temporal para detectar drift entre `schema.prisma` y la base real — sin ese permiso global, `prisma migrate dev` falla con `P3014`.

## ORM y migraciones (Prisma)

El esquema de la base de datos vive como código en [prisma/schema.prisma](prisma/schema.prisma) — es la fuente de verdad, no se edita la base a mano. `prisma.config.ts` lee `DATABASE_URL` (declarada en `.env` / `.env.example` / `ecosystem.config.js`, debe apuntar al mismo servidor que las variables `MARIADB_*`).

Generator configurado con `output = "../src/generated/prisma"` (gitignored, se regenera con `prisma generate` — ya se ejecuta automáticamente tras `migrate dev`/`migrate deploy`).

```
yarn db:migrate          # prisma migrate dev — crea+aplica una migración a partir de los cambios en schema.prisma (uso local)
yarn db:migrate:deploy   # prisma migrate deploy — aplica migraciones ya existentes sin generar nuevas (uso en servidores/CI)
yarn db:generate         # regenera el cliente TS sin tocar la base
yarn db:studio           # prisma studio — UI para inspeccionar/editar datos
```

Flujo de trabajo: modificar `schema.prisma` → `yarn db:migrate` (te pide nombre si no lo pasas con `--name`) → queda un archivo nuevo en `prisma/migrations/<timestamp>_<nombre>/migration.sql` que sí se versiona en git. Para apuntar a un servidor de base de datos nuevo (otra máquina, staging, etc.): solo hay que cambiar `DATABASE_URL` y correr `yarn db:migrate:deploy` — no hace falta tocar el esquema.

Modelos actuales:
- `User` (tabla `users`): `id` (int autoincrement, PK), `username` (varchar(100), unique), `password` (varchar(255) — MySQL/MariaDB no tiene un tipo nativo "password", se guarda el hash como varchar).

## Recursos actuales

### `products` — `GET /products/:barcode`

[src/services/product.service.ts](src/services/product.service.ts) → [src/controllers/product.controller.ts](src/controllers/product.controller.ts) → [src/routers/product.router.ts](src/routers/product.router.ts).

- No hay tabla de productos en la base de datos propia: el backend actúa de proxy/normalizador
  delante de la API pública de **Open Food Facts** (`https://world.openfoodfacts.net/api/v3.6/product/:barcode.json`).
- `getProductByBarcode` hace el `fetch` y lanza `ProductLookupError(status, message)` si Open
  Food Facts responde con error — el controller la captura y reenvía el mismo `status` con
  `{ error }`; cualquier otro fallo (red, JSON inválido) cae a un 502 genérico.
- El controller reproyecta el `product` crudo de Open Food Facts a un objeto propio con prefijo
  `product*` (`productName`, `productImage`, `productNutriscore`, `productNutriments`, etc.) —
  es la forma de desacoplar el contrato de la API pública del que consume el frontend. Al añadir
  un campo nuevo de Open Food Facts hay que: 1) añadirlo a la interfaz `Product` en
  `product.service.ts`, 2) mapearlo en `getProduct` (`product.controller.ts`).
- Todavía no existe ningún endpoint de escritura (crear/guardar producto en una nevera) — el
  frontend solo consulta este `GET` de lectura; ver el `CLAUDE.md` del frontend para el estado de
  la pantalla que lo consume (`AddProduct`).

## Frontend

El proyecto hermano `../frontend` (antes `public`) es Vite + React + TS, independiente de este
backend, y lo consume vía RTK Query apuntando a `VITE_API_URL` (por defecto
`http://localhost:4001`, debe coincidir con el `PORT` de aquí).
