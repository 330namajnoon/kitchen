# Kitchen — Frontend (public/)

Vite + React + TypeScript. Base para un proyecto grande: routing, estado global, estilos y
componentes UI ya configurados y listos para escalar.

## Stack

- **Vite** + **React 19** + **TypeScript**
- **react-router-dom** — routing
- **@reduxjs/toolkit** + **react-redux** — estado global
- **styled-components** — estilos de layout/estructura, con theme propio
- **MUI (@mui/material)** — componentes de UI (botones, inputs, etc.)
- Gestor de paquetes: **yarn** (usar `yarn`, no `npm`)

MUI y styled-components conviven: MUI para componentes de interfaz (inputs, botones, dialogs...),
styled-components para layout/estructura a medida. Ambos comparten los mismos colores (ver
`src/styles/colors.ts`) para que no se desincronicen visualmente.

## Alias de importación

Todo se importa con `@/` en vez de rutas relativas (`../../..`):

```ts
import { Home } from '@/pages/Home'
import { useAppSelector } from '@/store/hooks'
```

Configurado en dos sitios — si algún día deja de funcionar el alias, revisar ambos:
- [vite.config.ts](vite.config.ts) → `resolve.alias`
- [tsconfig.app.json](tsconfig.app.json) → `compilerOptions.paths`

## Estructura de carpetas

```
src/
  app/          # reservado para bootstrap/providers adicionales si crece
  components/   # componentes reutilizables compartidos entre páginas
  constants/    # constantes globales (enums, valores fijos)
  hooks/        # custom hooks compartidos
  layouts/      # layouts de página (ej. MainLayout con header/nav)
  pages/        # una carpeta por página
  routes/       # definición de rutas (AppRoutes.tsx, paths.ts)
  services/     # llamadas a API / clientes HTTP
  store/        # Redux: store, hooks tipados, slices/
  styles/       # colores, tema MUI, tema styled-components, estilos globales
  types/        # tipos TS compartidos
  utils/        # funciones auxiliares puras
```

### Convención de una página (`src/pages/<Nombre>/`)

Cada página es una carpeta con:
- `<Nombre>.tsx` — componente
- `<Nombre>.styles.ts` — styled-components de esa página (si hace falta)
- `index.ts` — re-export (`export { Nombre } from './Nombre'`)

Ejemplos ya creados: [src/pages/Home/](src/pages/Home/), [src/pages/Login/](src/pages/Login/).

Para añadir una página nueva:
1. Crear carpeta en `src/pages/NuevaPagina/` siguiendo la convención de arriba.
2. Añadir la ruta en [src/routes/paths.ts](src/routes/paths.ts) y en
   [src/routes/AppRoutes.tsx](src/routes/AppRoutes.tsx).
3. Si necesita link en el nav, añadirlo en [src/layouts/MainLayout.tsx](src/layouts/MainLayout.tsx).

## Llamadas a la API (RTK Query)

- [src/services/api.ts](src/services/api.ts) define el `api` base: un único `createApi` con
  `reducerPath: 'api'` y `fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL })`, con
  `endpoints: () => ({})` vacío.
- Cada dominio (productos, etc.) crea su propio `src/services/<dominio>Api.ts` que **inyecta**
  sus endpoints en ese `api` con `api.injectEndpoints({...})`, en vez de llamar a `createApi` de
  nuevo. Así todos comparten baseUrl, headers y `tagTypes` sin duplicar configuración. Ejemplo:
  [src/services/productsApi.ts](src/services/productsApi.ts).
- El store solo registra el `api` base (`api.reducerPath` / `api.middleware`) en
  [src/store/index.ts](src/store/index.ts) — los slices inyectados no necesitan tocar el store.
- URL del backend en `VITE_API_URL` (`.env`, por defecto `http://localhost:4001`).

Para añadir un endpoint nuevo:
1. Si el dominio ya tiene `services/<dominio>Api.ts`, añadir el endpoint ahí dentro de
   `injectEndpoints`. Si es un dominio nuevo, crear el archivo siguiendo el ejemplo de
   `productsApi.ts` (importa `api` de `./api`, nunca crea otro `createApi`).
2. Exportar el hook generado (`useXxxQuery` / `useXxxMutation`) y usarlo directo en el componente.

## Routing

- Rutas centralizadas en [src/routes/paths.ts](src/routes/paths.ts) (nunca hardcodear strings de
  rutas en componentes, usar `paths.home`, `paths.login`, etc.).
- [src/routes/AppRoutes.tsx](src/routes/AppRoutes.tsx) define el árbol de `<Routes>`. La mayoría
  de páginas cuelgan de `MainLayout` (header + `<Outlet />`); `ScanBarcode` va fuera porque ocupa
  toda la pantalla (cámara a pantalla completa, sin header).
- `BrowserRouter` vive en [src/main.tsx](src/main.tsx), a nivel raíz.
- Rutas con parámetro (ej. `/nevera/anadir/:code`) se declaran en `paths.ts` con el patrón
  (`:code`) para usar en `<Route path={...}>`, más una función builder (`buildAddProductPath(code)`)
  que arma la URL real para `navigate(...)`/`<Link>`. Ver `paths.addProduct` /
  `buildAddProductPath` como ejemplo a seguir para nuevas rutas dinámicas.

## Estado global (Redux)

- Store en [src/store/index.ts](src/store/index.ts) con `configureStore`.
- Slices en `src/store/slices/`, uno por dominio (ejemplo: [uiSlice.ts](src/store/slices/uiSlice.ts)).
- Usar siempre los hooks tipados de [src/store/hooks.ts](src/store/hooks.ts)
  (`useAppDispatch`, `useAppSelector`) en vez de los genéricos de `react-redux`.

Para añadir un slice nuevo:
1. Crear `src/store/slices/miSlice.ts` con `createSlice`.
2. Registrarlo en el `reducer` de [src/store/index.ts](src/store/index.ts).

## Colores y temas

Fuente única de verdad: [src/styles/colors.ts](src/styles/colors.ts). Ahora mismo tiene una
paleta índigo/cian por defecto — **pendiente de sustituir por los colores de marca reales**.
Cuando se decidan, solo hay que editar ese archivo; se propaga automáticamente a:

- [src/styles/theme.mui.ts](src/styles/theme.mui.ts) — tema de MUI (`palette`, tipografía,
  overrides de componentes).
- [src/styles/theme.styled.ts](src/styles/theme.styled.ts) — tema de styled-components
  (`theme.colors...` dentro de cualquier styled-component).
- [src/styles/GlobalStyle.ts](src/styles/GlobalStyle.ts) — estilos globales (`body`, reset).
- [src/styles/styled.d.ts](src/styles/styled.d.ts) — tipado del `DefaultTheme` de
  styled-components (para tener autocompletado de `theme.colors.*`).

Ambos providers están montados en [src/main.tsx](src/main.tsx): `MuiThemeProvider` +
`CssBaseline` y `StyledThemeProvider` + `GlobalStyle`.

## Responsive (obligatorio: desktop y móvil)

Todo lo que se construya tiene que verse bien tanto en desktop como en móvil. No es opcional,
es una regla del proyecto. Convenciones:

- **Breakpoints compartidos** en [src/styles/breakpoints.ts](src/styles/breakpoints.ts)
  (`xs/sm/md/lg/xl`, mismos valores que usa MUI por defecto). En styled-components se usan así,
  mobile-first (estilos base = móvil, luego se amplía hacia pantallas grandes):

  ```ts
  import { media } from '@/styles/breakpoints'

  export const Card = styled.div`
    padding: 16px;

    ${media.up('sm')} {
      padding: 32px;
    }
  `
  ```

- **En MUI**, usar directamente `theme.breakpoints` / el prop `sx` con objeto responsive
  (`sx={{ padding: { xs: 2, sm: 4 } }}`) en vez de valores fijos cuando el spacing cambie mucho
  entre tamaños.
- El tema de MUI ([theme.mui.ts](src/styles/theme.mui.ts)) tiene `responsiveFontSizes()`
  aplicado, así que los `variant` de `Typography` (`h1`...`h6`, etc.) ya escalan solos entre
  breakpoints — no hace falta tocarlos manualmente.
- Layouts que se apilan en móvil pero van en fila en desktop: `flex-direction: column` por
  defecto + `${media.up('md')} { flex-direction: row; }`.
- Antes de dar por terminada cualquier página o componente nuevo, comprobar visualmente en un
  ancho estrecho (~375px, ej. DevTools responsive mode) además de desktop.

## Comandos

```bash
yarn dev       # servidor de desarrollo
yarn build     # type-check (tsc -b) + build de producción
yarn lint      # eslint
yarn preview   # sirve el build de producción localmente
```

## Estado actual

- Páginas:
  - `Home` — demo de MUI Button + Redux.
  - `Login` — formulario MUI con TextFields, sin autenticación real (no llama a ningún servicio).
  - `Fridge` (`/nevera`) — grid de productos reales (`useGetFridgeProductsQuery`, vía
    `fridgeApi`), con un `SpeedDial` para añadir producto a mano o escaneando código de barras.
    Cada tarjeta es un `<button>` (`ProductCard`) que navega a `EditProduct` con
    `buildEditProductPath(product.id)`, pasando el producto ya cargado por `location.state` para
    no tener que refetchear.
  - `ScanBarcode` (`/nevera/escanear`) — abre la cámara y usa `barcode-detector` para leer el
    código; al detectarlo navega a `AddProduct` con `buildAddProductPath(code)`.
  - `AddProduct` (`/nevera/anadir/:code`) — llama a `GET /products/:code` del backend
    (`useGetProductByCodeQuery`, vía `productsApi`) y pinta los datos de Open Food Facts
    (nombre, foto, marca, Nutri-Score/Eco-Score/Nova, alérgenos) junto a un formulario con los
    campos que Open Food Facts no provee y hay que rellenar a mano (descripción, categoría,
    fecha de caducidad, cantidad restante %, comentario). El submit llama a
    `useAddFridgeProductMutation` (`POST /fridge-products`) y redirige a `Fridge`.
  - `EditProduct` (`/nevera/:id/editar`) — mismo formulario que `AddProduct` (descripción,
    categoría, fecha de caducidad, cantidad restante %, comentario) pero para un producto ya
    guardado: lee el producto de `location.state` si viene de tocar una tarjeta en `Fridge`, o
    si no (ej. recarga directa de la URL) lo busca por `id` dentro de
    `useGetFridgeProductsQuery()`. Tiene botón "Guardar" (`useUpdateFridgeProductMutation`,
    `PUT /fridge-products/:id`) y botón "Borrar producto" (`useDeleteFridgeProductMutation`,
    `DELETE /fridge-products/:id`, con `window.confirm` antes de borrar). Ambos redirigen a
    `Fridge` al terminar.
- Sin dark mode configurado (solo `mode: 'light'` en el tema de MUI).
