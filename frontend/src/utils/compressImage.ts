const MAX_DIMENSION = 1920
const TARGET_SIZE_RATIO = 0.2 // 20% del tamaño original = reducción del 80%
const MIN_QUALITY = 0.4
const INITIAL_QUALITY = 0.8
const QUALITY_STEP = 0.1
const SKIP_BELOW_BYTES = 50 * 1024 // no merece la pena comprimir imágenes ya muy ligeras
const SKIP_TYPES = ['image/gif', 'image/svg+xml']

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo comprimir la imagen'))), 'image/jpeg', quality)
  })

/** Redimensiona y recomprime una imagen en el navegador antes de subirla, apuntando a reducir su
 * peso en ~80% (formatos animados/vectoriales y archivos ya pequeños se devuelven sin tocar). */
export const compressImage = async (source: File | Blob, fallbackName = 'photo.jpg'): Promise<File> => {
  const originalName = source instanceof File ? source.name : fallbackName
  const asFile = (blob: Blob, name: string) => new File([blob], name, { type: blob.type })

  if (source.size <= SKIP_BELOW_BYTES || SKIP_TYPES.includes(source.type)) {
    return asFile(source, originalName)
  }

  const bitmap = await createImageBitmap(source)
  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return asFile(source, originalName)
    ctx.drawImage(bitmap, 0, 0, width, height)

    const targetSize = source.size * TARGET_SIZE_RATIO
    let quality = INITIAL_QUALITY
    let blob = await canvasToBlob(canvas, quality)
    while (blob.size > targetSize && quality > MIN_QUALITY) {
      quality -= QUALITY_STEP
      blob = await canvasToBlob(canvas, quality)
    }

    if (blob.size >= source.size) return asFile(source, originalName)

    const newName = originalName.replace(/\.\w+$/, '') + '.jpg'
    return asFile(blob, newName)
  } finally {
    bitmap.close()
  }
}
