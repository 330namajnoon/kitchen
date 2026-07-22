export const paths = {
  home: '/',
  login: '/login',
  fridge: '/nevera',
  scanBarcode: '/nevera/escanear',
  addProduct: '/nevera/anadir/:code',
} as const

export const buildAddProductPath = (code: string) => `/nevera/anadir/${code}`
