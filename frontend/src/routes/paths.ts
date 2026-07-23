export const paths = {
  home: '/',
  login: '/login',
  fridge: '/nevera',
  scanBarcode: '/nevera/escanear',
  addProduct: '/nevera/anadir/:code',
  editProduct: '/nevera/:id/editar',
} as const

export const buildAddProductPath = (code: string) => `/nevera/anadir/${code}`
export const buildEditProductPath = (id: number) => `/nevera/${id}/editar`
