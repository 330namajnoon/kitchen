export const paths = {
  home: '/',
  login: '/login',
  products: '/productos',
  scanBarcode: '/productos/escanear',
  detectProduct: '/productos/detectar',
  addProduct: '/productos/anadir/:code',
  editProduct: '/productos/:id/editar',
  genericProducts: '/productos-genericos',
  addGenericProduct: '/productos-genericos/anadir',
  editGenericProduct: '/productos-genericos/:id/editar',
  recipes: '/recetas',
  addRecipe: '/recetas/anadir',
  editRecipe: '/recetas/:id/editar',
} as const

export const buildAddProductPath = (code: string) => `/productos/anadir/${code}`
export const buildEditProductPath = (id: number) => `/productos/${id}/editar`
export const buildEditGenericProductPath = (id: number) => `/productos-genericos/${id}/editar`
export const buildEditRecipePath = (id: number) => `/recetas/${id}/editar`
