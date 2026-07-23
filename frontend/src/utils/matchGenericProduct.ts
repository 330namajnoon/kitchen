import type { GenericProduct } from '@/types/genericProduct'

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()

/** Busca, entre los productos genéricos existentes, el primero cuyo nombre aparezca en alguno de los textos dados (o al revés). */
export const findMatchingGenericProduct = (
  texts: Array<string | undefined>,
  genericProducts: GenericProduct[] | undefined,
): GenericProduct | null => {
  if (!genericProducts?.length) return null

  const normalizedTexts = texts.filter((text): text is string => Boolean(text?.trim())).map(normalize)
  if (!normalizedTexts.length) return null

  return (
    genericProducts.find((genericProduct) => {
      const name = normalize(genericProduct.name)
      if (!name) return false
      return normalizedTexts.some((text) => text.includes(name) || name.includes(text))
    }) ?? null
  )
}
