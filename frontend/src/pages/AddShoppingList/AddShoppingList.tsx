import { useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useFormik } from 'formik'
import * as yup from 'yup'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { ShoppingListForm } from '@/components/ShoppingListForm'
import { useGetGenericProductsQuery } from '@/services/genericProductsApi'
import { useGetProductsQuery } from '@/services/productsApi'
import { useGetRecipesQuery } from '@/services/recipesApi'
import { useAddShoppingListMutation } from '@/services/shoppingListsApi'
import { paths } from '@/routes/paths'
import type { ShoppingListFormValues, ShoppingListItemInput } from '@/types/shoppingList'
import { AddShoppingListWrapper, PageTitle } from './AddShoppingList.styles'

const DRAFT_STORAGE_KEY = 'kitchen:addShoppingListDraft'

const validationSchema = yup.object({
  estimatedPurchaseDate: yup.string().required('La fecha estimada es obligatoria'),
  items: yup.array().min(1, 'Añade al menos un producto'),
})

const parseRecipeIds = (raw: string | null) =>
  raw
    ? raw
        .split(',')
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value))
    : []

export const AddShoppingList = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const recipeIds = useMemo(() => parseRecipeIds(searchParams.get('recipeIds')), [searchParams])
  const { data: genericProducts } = useGetGenericProductsQuery()
  const { data: products } = useGetProductsQuery()
  const { data: recipes } = useGetRecipesQuery(undefined, { skip: recipeIds.length === 0 })
  const [addShoppingList, { isLoading: isSaving }] = useAddShoppingListMutation()

  const formik = useFormik<ShoppingListFormValues>({
    initialValues: {
      estimatedPurchaseDate: '',
      status: 'pending',
      items: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await addShoppingList({
          estimatedPurchaseDate: values.estimatedPurchaseDate,
          items: values.items,
        }).unwrap()
        sessionStorage.removeItem(DRAFT_STORAGE_KEY)
        navigate(paths.shoppingLists)
      } catch {
        // el error se muestra debajo del formulario
      }
    },
  })

  // Mismo patrón que AddRecipe: al crear un producto genérico nuevo (o un producto nuevo para un
  // ingrediente) desde el editor se navega a otra página y se vuelve, así que el borrador se
  // guarda en sessionStorage para sobrevivir al remontaje y lo creado se refleja automáticamente.
  const hasHydratedDraft = useRef(false)
  // Si venimos de "Recetas" con ?recipeIds=..., el listado de ingredientes se rellena solo en
  // cuanto lleguen las recetas — pero no si ya había un borrador (venimos de crear un producto).
  const skipRecipePrefill = useRef(false)
  const hasAppliedRecipePrefill = useRef(false)

  useEffect(() => {
    if (hasHydratedDraft.current) return
    hasHydratedDraft.current = true

    let draft: Partial<ShoppingListFormValues> | null = null
    const draftRaw = sessionStorage.getItem(DRAFT_STORAGE_KEY)
    if (draftRaw) {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY)
      try {
        draft = JSON.parse(draftRaw)
      } catch {
        // borrador corrupto, se ignora
      }
    }

    const state = location.state as { createdGenericProductId?: number } | null
    const createdGenericProductId = state?.createdGenericProductId

    if (draft || createdGenericProductId) {
      skipRecipePrefill.current = true

      const base = draft ? { ...formik.values, ...draft } : formik.values
      const values =
        !createdGenericProductId || base.items.some((item) => item.genericProductId === createdGenericProductId)
          ? base
          : {
              ...base,
              items: [...base.items, { genericProductId: createdGenericProductId, quantityAmount: 0, quantityUnit: 'g' as const }],
            }
      formik.setValues(values)
    }

    if (createdGenericProductId) {
      navigate(location.pathname, { replace: true, state: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Rellena los ingredientes a partir de las recetas seleccionadas, agrupando por producto
  // genérico y sumando cantidades cuando comparten unidad — solo la primera vez.
  useEffect(() => {
    if (hasAppliedRecipePrefill.current || skipRecipePrefill.current) return
    if (recipeIds.length === 0 || !recipes) return
    hasAppliedRecipePrefill.current = true

    const itemsByGenericProductId = new Map<number, ShoppingListItemInput>()
    recipes
      .filter((recipe) => recipeIds.includes(recipe.id))
      .forEach((recipe) => {
        recipe.ingredients.forEach((ingredient) => {
          const existing = itemsByGenericProductId.get(ingredient.genericProductId)
          if (existing && existing.quantityUnit === ingredient.quantityUnit) {
            existing.quantityAmount += ingredient.quantityAmount
          } else if (!existing) {
            itemsByGenericProductId.set(ingredient.genericProductId, {
              genericProductId: ingredient.genericProductId,
              quantityAmount: ingredient.quantityAmount,
              quantityUnit: ingredient.quantityUnit,
            })
          }
        })
      })

    if (itemsByGenericProductId.size > 0) formik.setFieldValue('items', Array.from(itemsByGenericProductId.values()))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeIds, recipes])

  const handleCreateGenericProduct = () => {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formik.values))
    navigate(paths.addGenericProduct, { state: { returnTo: paths.addShoppingList } })
  }

  const handleAddProduct = (genericProductId: number, method: 'manual' | 'scan' | 'ai') => {
    if (method === 'manual') return

    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formik.values))
    navigate(method === 'scan' ? paths.scanBarcode : paths.detectProduct, {
      state: { returnTo: paths.addShoppingList, presetGenericProductId: genericProductId },
    })
  }

  return (
    <AddShoppingListWrapper>
      <PageTitle>Nueva lista de la compra</PageTitle>

      <ShoppingListForm
        formik={formik}
        genericProducts={genericProducts ?? []}
        products={products ?? []}
        onCreateGenericProduct={handleCreateGenericProduct}
        onAddProduct={handleAddProduct}
        footer={
          <Button type="submit" variant="contained" fullWidth disabled={isSaving}>
            {isSaving ? <CircularProgress size={24} /> : 'Guardar lista'}
          </Button>
        }
      />
    </AddShoppingListWrapper>
  )
}
