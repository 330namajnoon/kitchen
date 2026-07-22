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

## Routing

- Rutas centralizadas en [src/routes/paths.ts](src/routes/paths.ts) (nunca hardcodear strings de
  rutas en componentes, usar `paths.home`, `paths.login`, etc.).
- [src/routes/AppRoutes.tsx](src/routes/AppRoutes.tsx) define el árbol de `<Routes>`. Todas las
  páginas actuales cuelgan de `MainLayout` (header + `<Outlet />`).
- `BrowserRouter` vive en [src/main.tsx](src/main.tsx), a nivel raíz.

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

- Páginas: `Home` (demo de MUI Button + Redux) y `Login` (formulario MUI con TextFields).
- Sin autenticación real todavía — el formulario de Login no llama a ningún servicio.
- Sin dark mode configurado (solo `mode: 'light'` en el tema de MUI).
