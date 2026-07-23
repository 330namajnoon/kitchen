export interface AddGenericProductRequest {
  name: string
  description?: string
}

export interface GenericProduct extends AddGenericProductRequest {
  id: number
  createdAt: string
}

export interface UpdateGenericProductRequest extends Partial<AddGenericProductRequest> {
  id: number
}
