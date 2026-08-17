import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import type { SerializedError } from '@reduxjs/toolkit'

export function getUploadErrorMessage(error: FetchBaseQueryError | SerializedError | undefined): string {
  if (!error) return 'No se ha podido subir la foto. Inténtalo de nuevo.'

  if ('status' in error) {
    if (error.status === 'FETCH_ERROR') return 'No se ha podido subir la foto: sin conexión con el servidor.'
    if (error.status === 401 || error.status === 403) return 'No se ha podido subir la foto: sesión caducada, vuelve a intentarlo.'
    return `No se ha podido subir la foto (error ${error.status}).`
  }

  return 'No se ha podido subir la foto. Inténtalo de nuevo.'
}
